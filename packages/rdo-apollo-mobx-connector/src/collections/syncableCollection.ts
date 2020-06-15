import { observable, computed } from 'mobx';
import { ISyncableRDOCollection, CollectionUtils, SyncUtils } from '@ablestack/rdo';
import { Logger } from '@ablestack/rdo/infrastructure/logger';

const logger = Logger.make('SyncableCollection');
/**
 *
 *
 * @export
 * @class SyncableCollection
 * @implements {ISyncableRDOCollection<S, D>}
 * @implements {Map<string, D>}
 * @template S
 * @template D
 * @description: A Map collection, with an built in observable array (accessed via array$). Manages the internal array in parallel with the internal map in order to only trigger observable changes when necessary
 */
export class SyncableCollection<S, D> implements ISyncableRDOCollection<S, D>, Omit<Map<string, D>, 'Symbol.iterator'> {
  @observable.shallow private _map$: Map<string, D>;

  // -----------------------------------
  // IRdoFactory
  // -----------------------------------
  public makeRdoCollectionKeyFromSourceElement?: (node: S) => string;
  public makeRdoCollectionKeyFromRdoElement?: (node: D) => string;
  public makeRdo: (sourceItem: S) => D;

  @computed public get size(): number {
    return this._map$.size;
  }

  @observable.shallow private _array$ = new Array<D>();
  @computed public get array$(): Array<D> {
    return this._array$;
  }

  constructor({
    makeRdoCollectionKeyFromSourceElement,
    makeRdoCollectionKeyFromRdoElement,
    makeRdo,
  }: {
    makeRdoCollectionKeyFromSourceElement?: (sourceNode: S) => string;
    makeRdoCollectionKeyFromRdoElement?: (rdo: D) => string;
    makeRdo: (sourceNode: S) => D;
  }) {
    this.makeRdoCollectionKeyFromSourceElement = makeRdoCollectionKeyFromSourceElement;
    this.makeRdoCollectionKeyFromRdoElement = makeRdoCollectionKeyFromRdoElement;
    this.makeRdo = makeRdo;
    this._map$ = new Map<string, D>();
  }

  // -----------------------------------
  // Map Interface
  // -----------------------------------
  delete(key: string): boolean {
    return this.deleteElement(key);
  }

  forEach(callbackfn: (value: D, key: string, map: Map<string, D>) => void, thisArg?: any): void {
    this._map$.forEach(callbackfn);
  }

  get(key: string): D | undefined {
    return this._map$.get(key);
  }

  has(key: string): boolean {
    return this._map$.has(key);
  }

  set(key: string, value: D): this {
    this.insertElement(value);
    return this;
  }

  entries(): IterableIterator<[string, D]> {
    return this._map$.entries();
  }

  keys(): IterableIterator<string> {
    return this._map$.keys();
  }

  values(): IterableIterator<D> {
    return this._map$.values();
  }

  clear(): void {
    this.clearElements();
  }

  [Symbol.toStringTag]: string = '[object Map]';

  [Symbol.iterator](): IterableIterator<D> {
    return this._array$.values();
  }

  // -----------------------------------
  // ISyncableCollection
  // -----------------------------------
  public getCollectionKeys = () => {
    return Array.from(this._map$.keys());
  };

  public getElement = (key: string) => {
    return this._map$.get(key);
  };

  public insertElement = (value: D) => {
    if (this.makeRdoCollectionKeyFromRdoElement) {
      const key = this.makeRdoCollectionKeyFromRdoElement(value);
      if (!this._map$.has(key)) {
        this._map$.set(key, value);
        CollectionUtils.Array.insertElement<D>({ collection: this._array$!, key, value });
        return true;
      } else return false;
    } else {
      throw new Error('makeRdoCollectionKeyFromRdoElement element must be available for ISyncableRDOCollection insert operations');
    }
  };

  public updateElement = (key: string, value: D) => {
    if (this.makeRdoCollectionKeyFromRdoElement) {
      if (!this._map$.has(key)) {
        this._map$.set(key, value);
        CollectionUtils.Array.updateElement<D>({ collection: this._array$!, makeElementKey: this.makeRdoCollectionKeyFromRdoElement, value });
        return true;
      } else return false;
    } else {
      throw new Error('makeRdoCollectionKeyFromRdoElement element must be available for ISyncableRDOCollection update operations');
    }
  };

  public deleteElement = (key: string) => {
    const itemToDelete = this._map$.get(key);
    if (itemToDelete) {
      this._map$.delete(key);

      // Get index from array
      const indexOfItemToDelete = this.array$.indexOf(itemToDelete);
      if (indexOfItemToDelete !== -1) {
        this.array$.splice(indexOfItemToDelete, 1);
      } else {
        logger.error(`tryDeleteItemFromTargetCollection - could not find array item for ISyncableRDOCollection ${key}. Rebuilding array`);
        this._array$ = Array.from(this._map$.values());
      }

      return true;
    }
    return false;
  };

  public clearElements = () => {
    this._map$.clear();
    return CollectionUtils.Array.clear({ collection: this._array$! });
  };
}
