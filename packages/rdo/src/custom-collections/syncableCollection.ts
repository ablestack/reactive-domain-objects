import { observable, computed } from 'mobx';
import { ISyncableRDOCollection, MakeCollectionKeyMethod, IRdoNodeWrapper, CollectionUtils } from '..';
import { Logger } from '../infrastructure/logger';

const logger = Logger.make('SyncableCollection');
/**
 *
 *
 * @export
 * @class SyncableCollection
 * @implements {ISyncableRDOCollection<S, D>}
 * @implements {Map<K, D>}
 * @template S
 * @template D
 * @description: A Map collection, with an built in observable array (accessed via array$). Manages the internal array in parallel with the internal map so as to only trigger observable changes when necessary
 */
export class SyncableCollection<K extends string | number | symbol, S, D> implements ISyncableRDOCollection<K, S, D>, Map<K, D> {
  @observable.shallow private _map$: Map<K, D>;

  // -----------------------------------
  // IRdoFactory
  // -----------------------------------
  private _makeCollectionKeyFromSourceElement?: MakeCollectionKeyMethod<K, S>;
  private _makeCollectionKeyFromRdoElement?: MakeCollectionKeyMethod<K, D>;
  private _makeRdo?: (sourceItem: S) => D;

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
    makeCollectionKeyFromSourceElement?: MakeCollectionKeyMethod<K, S>;
    makeCollectionKeyFromRdoElement?: MakeCollectionKeyMethod<K, D>;
    makeRdo?: (sourceNode: S) => D;
  } = {}) {
    this._makeCollectionKeyFromSourceElement = makeCollectionKeyFromSourceElement;
    this._makeCollectionKeyFromRdoElement = makeCollectionKeyFromRdoElement;
    this._makeRdo = makeRdo;
    this._map$ = new Map<K, D>();
  }

  // -----------------------------------
  // Map Interface
  // -----------------------------------
  delete(key: K): boolean {
    return !!this.deleteElement(key);
  }

  forEach(callbackfn: (value: D, key: K, map: Map<K, D>) => void, thisArg?: any): void {
    this._map$.forEach(callbackfn);
  }

  get(key: K): D | undefined {
    return this._map$.get(key);
  }

  has(key: K): boolean {
    return this._map$.has(key);
  }

  set(key: K, value: D): this {
    this.insertElement(key, value);
    return this;
  }

  entries(): IterableIterator<[K, D]> {
    return this._map$.entries();
  }

  keys(): IterableIterator<K> {
    return this._map$.keys();
  }

  values(): IterableIterator<D> {
    return this._map$.values();
  }

  clear(): void {
    this.clearElements();
  }

  [Symbol.iterator](): IterableIterator<[K, D]> {
    return this._map$.entries();
  }

  [Symbol.toStringTag]: string = 'Map';

  // -----------------------------------
  // ISyncableRdoCollection
  // -----------------------------------
  public makeCollectionKeyFromSourceElement = (item: S): K | undefined => {
    if (this._makeCollectionKeyFromSourceElement) return this._makeCollectionKeyFromSourceElement(item);
    else return undefined;
  };

  public makeCollectionKeyFromRdoElement = (item: D): K | undefined => {
    if (this._makeCollectionKeyFromRdoElement) return this._makeCollectionKeyFromRdoElement(item);
    else return undefined;
  };

  public makeRdo(sourceItem: S, parentRdoNodeWrapper: IRdoNodeWrapper<K, S, D>) {
    if (!this._makeRdo) return undefined;
    return this._makeRdo(sourceItem);
  }

  public getCollectionKeys = () => {
    return Array.from(this._map$.keys());
  };

  public elements(): Iterable<D> {
    return this._map$.values();
  }

  public getElement = (key: K) => {
    return this._map$.get(key);
  };

  public insertElement = (key: K, value: D) => {
    if (!this._map$.has(key)) {
      this._map$.set(key, value);
      CollectionUtils.Array.insertElement<K, D>({ collection: this._array$!, key, value });
      return true;
    } else return false;
  };

  public updateElement = (key: K, value: D) => {
    if (this.makeCollectionKeyFromRdoElement) {
      if (!this._map$.has(key)) {
        this._map$.set(key, value);
        CollectionUtils.Array.updateElement<K, D>({ collection: this._array$!, makeCollectionKey: this.makeCollectionKeyFromRdoElement, value });
        return true;
      } else return false;
    } else {
      throw new Error('makeCollectionKeyFromRdoElement element must be available for ISyncableRDOCollection update operations');
    }
  };

  public deleteElement = (key: K) => {
    const itemToDelete = this._map$.get(key);
    if (itemToDelete) {
      this._map$.delete(key);

      // Get index from array
      const indexOfItemToDelete = this.array$.indexOf(itemToDelete);
      if (indexOfItemToDelete !== -1) {
        return this.array$.splice(indexOfItemToDelete, 1)[0];
      } else {
        logger.error(`tryDeleteItemFromTargetCollection - could not find array item for ISyncableRDOCollection ${key}. Rebuilding array`);
        this._array$ = Array.from(this._map$.values());
      }

      return undefined;
    }
    return undefined;
  };

  public clearElements = () => {
    this._map$.clear();
    return CollectionUtils.Array.clear({ collection: this._array$! });
  };
}
