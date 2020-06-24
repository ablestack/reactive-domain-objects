import { observable, computed } from 'mobx';
import { ISyncableRDOCollection, MakeCollectionKeyMethod, IRdoNodeWrapper, CollectionUtils, CollectionNodePatchOperation } from '..';
import { Logger } from '../infrastructure/logger';

const logger = Logger.make('SyncableCollection');
/**
 *
 *
 * @export
 * @class ListMap
 * @implements {ISyncableRDOCollection<S, D>}
 * @implements {Map<K, D>}
 * @template S
 * @template D
 * @description: A readonly, syncable, Map-Array collection hybrid, with an built in observable array (accessed via array$). Manages the internal array in parallel with the internal map so as to only trigger observable changes when necessary
 */
export class ListMap<K extends string | number, S, D> implements ISyncableRDOCollection<K, S, D> {
  @observable.shallow private _map$: Map<K, D>;

  // -----------------------------------
  // IRdoFactory
  // -----------------------------------
  private _makeCollectionKey?: MakeCollectionKeyMethod<K, S>;
  private _makeRdo?: (sourceItem: S) => D;

  @computed public get size(): number {
    return this._map$.size;
  }

  @observable.shallow private _array$ = new Array<D>();
  @computed public get array$(): Array<D> {
    return this._array$;
  }

  constructor({
    makeCollectionKey,
    makeRdo,
  }: {
    makeCollectionKey?: MakeCollectionKeyMethod<K, S>;
    makeRdo?: (sourceNode: S) => D;
  } = {}) {
    this._makeCollectionKey = makeCollectionKey;
    this._makeRdo = makeRdo;
    this._map$ = new Map<K, D>();
  }

  // -----------------------------------
  // Readonly Map Interface
  // -----------------------------------
  forEach(callbackfn: (value: D, key: K, map: Map<K, D>) => void, thisArg?: any): void {
    this._map$.forEach(callbackfn);
  }

  get(key: K): D | undefined {
    return this._map$.get(key);
  }

  has(key: K): boolean {
    return this._map$.has(key);
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

  [Symbol.iterator](): IterableIterator<[K, D]> {
    return this._map$.entries();
  }

  [Symbol.toStringTag]: string = 'ListMap';

  // -----------------------------------
  // ISyncableRdoCollection
  // -----------------------------------
  public makeCollectionKey = (item: S): K => {
    if (!this._makeCollectionKey) throw new Error('Could not find makeCollectionKey method');
    return this._makeCollectionKey(item);
  };

  public makeRdo(sourceItem: S, parentRdoNodeWrapper: IRdoNodeWrapper<K, S, D>) {
    if (!this._makeRdo) return undefined;
    return this._makeRdo(sourceItem);
  }

  public elements(): Iterable<D> {
    return this._map$.values();
  }

  public patchAdd(patchOp: CollectionNodePatchOperation<K, D>) {
    if (!patchOp.rdo) throw new Error(`Rdo must not be null for patch-add operations - sourceNodeTypePath - Key:${patchOp.key}`);
    this._map$.set(patchOp.key, patchOp.rdo);
    this._array$.splice(patchOp.index, 0, patchOp.rdo);
  }

  public patchDelete(patchOp: Omit<CollectionNodePatchOperation<K, D>, 'op'>) {
    this._map$.delete(patchOp.key);
    this._array$.splice(patchOp.index, 1);
  }
}
