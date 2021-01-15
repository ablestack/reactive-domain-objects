import { computed, observable } from 'mobx';
import { IRdoNodeWrapper, ISyncableRDOKeyBasedCollection, MakeCollectionKeyMethod } from '..';
import { Logger } from '../infrastructure/logger';

const logger = Logger.make('ListMap');
/**
 *
 *
 * @export
 * @class ListMap
 * @implements {ISyncableRDOKeyBasedCollection<S, D>}
 * @implements {Map<string | number, D>}
 * @template S
 * @template D
 * @description: A readonly, syncable, Map-Array collection hybrid, with a built in observable array (accessed via array$). Manages the internal array in parallel with the internal map so as to only trigger observable changes when necessary
 */
export class ListMap<S, D> implements ISyncableRDOKeyBasedCollection<S, D> {
  @observable.shallow private _map$: Map<string | number, D>;
  private indexByKeyMap = new Map<string | number, number>();

  // -----------------------------------
  // IRdoFactory
  // -----------------------------------
  private _makeCollectionKey?: MakeCollectionKeyMethod<S>;
  private _makeRdo?: (sourceItem: S) => D;

  @computed public get size(): number {
    return this._map$.size;
  }

  @observable.shallow private _array$: D[] | null = null;
  @computed public get array$(): Array<D> {
    if (!this._array$) this._array$ = Array.from(this._map$.values());
    return this._array$;
  }

  constructor({
    makeCollectionKey,
    makeRdo,
  }: {
    makeCollectionKey?: MakeCollectionKeyMethod<S>;
    makeRdo?: (sourceNode: S) => D;
  } = {}) {
    this._makeCollectionKey = makeCollectionKey;
    this._makeRdo = makeRdo;
    this._map$ = new Map<string | number, D>();
  }

  // -----------------------------------
  // Readonly Map Interface
  // -----------------------------------
  forEach(callbackfn: (value: D, key: string | number, map: Map<string | number, D>) => void, thisArg?: any): void {
    this._map$.forEach(callbackfn);
  }

  get(key: string | number): D | undefined {
    return this._map$.get(key);
  }

  has(key: string | number): boolean {
    return this._map$.has(key);
  }

  entries(): IterableIterator<[string | number, D]> {
    return this._map$.entries();
  }

  keys(): IterableIterator<string | number> {
    return this._map$.keys();
  }

  values(): IterableIterator<D> {
    return this._map$.values();
  }

  [Symbol.iterator](): IterableIterator<[string | number, D]> {
    return this._map$.entries();
  }

  [Symbol.toStringTag]: string = 'ListMap';

  // -----------------------------------
  // ISyncableRdoCollection
  // -----------------------------------

  public elements(): Iterable<D> {
    return this._map$.values();
  }

  public add = ({ key, newItem }: { key: string | number; newItem: D }) => {
    this._map$.set(key, newItem);
    this._array$ = null;
    return true;
  };

  public replace = ({ key, origItem, newItem }: { key: string | number; origItem: D; newItem: D }) => {
    this._map$.set(key, newItem);
    this._array$ = null;
    return true;
  };

  public delete = ({ key, origItem }: { key: string | number; origItem: D }) => {
    this._map$.delete(key);
    this._array$ = null;
    return true;
  };

  //------------------------------
  // RdoSyncableCollectionNW
  //------------------------------
  public tryMakeCollectionKey(item: S, index: number) {
    if (!this._makeCollectionKey) return undefined;
    return this._makeCollectionKey(item);
  }

  public makeRdo(sourceItem: S) {
    if (!this._makeRdo) return undefined;
    return this._makeRdo(sourceItem);
  }
}
