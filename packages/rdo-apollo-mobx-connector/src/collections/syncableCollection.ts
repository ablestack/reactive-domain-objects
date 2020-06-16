import { observable, computed } from 'mobx';
import { ISyncableRDOCollection, CollectionUtils, SyncUtils, MakeCollectionKeyMethod } from '@ablestack/rdo';
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
 * @description: A Map collection, with an built in observable array (accessed via array$). Manages the internal array in parallel with the internal map so as to only trigger observable changes when necessary
 */
export class SyncableCollection<S, D> implements ISyncableRDOCollection<S, D>, Map<string, D> {
  @observable.shallow private _map$: Map<string, D>;

  // -----------------------------------
  // IRdoFactory
  // -----------------------------------
  private _makeCollectionKeyFromSourceElement?: MakeCollectionKeyMethod<S>;
  private _makeCollectionKeyFromRdoElement?: MakeCollectionKeyMethod<D>;
  private _makeRdo: (sourceItem: S) => D;

  @computed public get size(): number {
    return this._map$.size;
  }

  @observable.shallow private _array$ = new Array<D>();
  @computed public get array$(): Array<D> {
    return this._array$;
  }

  constructor({
    makeCollectionKeyFromSourceElement,
    makeCollectionKeyFromRdoElement,
    makeRdo,
  }: {
    makeCollectionKeyFromSourceElement?: MakeCollectionKeyMethod<S>;
    makeCollectionKeyFromRdoElement?: MakeCollectionKeyMethod<D>;
    makeRdo: (sourceNode: S) => D;
  }) {
    this._makeCollectionKeyFromSourceElement = makeCollectionKeyFromSourceElement;
    this._makeCollectionKeyFromRdoElement = makeCollectionKeyFromRdoElement;
    this._makeRdo = makeRdo;
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
    this.insertElement(key, value);
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

  [Symbol.iterator](): IterableIterator<[string, D]> {
    return this._map$.entries();
  }

  [Symbol.toStringTag]: string = 'Map';

  // -----------------------------------
  // ISyncableRdoCollection
  // -----------------------------------
  public makeCollectionKeyFromSourceElement = (item: S): string | undefined => {
    if (this._makeCollectionKeyFromSourceElement) return this._makeCollectionKeyFromSourceElement(item);
    else return undefined;
  };

  public makeCollectionKeyFromRdoElement = (item: D): string | undefined => {
    if (this._makeCollectionKeyFromRdoElement) return this._makeCollectionKeyFromRdoElement(item);
    else return undefined;
  };

  public makeRdo(sourceItem: S) {
    return this._makeRdo(sourceItem);
  }

  public getCollectionKeys = () => {
    return Array.from(this._map$.keys());
  };

  public elements(): Iterable<D> {
    return this._map$.values();
  }

  public getElement = (key: string) => {
    return this._map$.get(key);
  };

  public insertElement = (key: string, value: D) => {
    if (!this._map$.has(key)) {
      this._map$.set(key, value);
      CollectionUtils.Array.insertElement<D>({ collection: this._array$!, key, value });
      return true;
    } else return false;
  };

  public updateElement = (key: string, value: D) => {
    if (this.makeCollectionKeyFromRdoElement) {
      if (!this._map$.has(key)) {
        this._map$.set(key, value);
        CollectionUtils.Array.updateElement<D>({ collection: this._array$!, makeCollectionKey: this.makeCollectionKeyFromRdoElement, value });
        return true;
      } else return false;
    } else {
      throw new Error('makeCollectionKeyFromRdoElement element must be available for ISyncableRDOCollection update operations');
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
