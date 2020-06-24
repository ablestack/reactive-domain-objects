import { ISyncableRDOCollection, MakeCollectionKeyMethod, IRdoNodeWrapper, CollectionNodePatchOperation } from '..';
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
export declare class ListMap<K extends string | number, S, D> implements ISyncableRDOCollection<K, S, D> {
    private _map$;
    private _makeCollectionKey?;
    private _makeRdo?;
    get size(): number;
    private _array$;
    get array$(): Array<D>;
    constructor({ makeCollectionKey, makeRdo, }?: {
        makeCollectionKey?: MakeCollectionKeyMethod<K, S>;
        makeRdo?: (sourceNode: S) => D;
    });
    forEach(callbackfn: (value: D, key: K, map: Map<K, D>) => void, thisArg?: any): void;
    get(key: K): D | undefined;
    has(key: K): boolean;
    entries(): IterableIterator<[K, D]>;
    keys(): IterableIterator<K>;
    values(): IterableIterator<D>;
    [Symbol.iterator](): IterableIterator<[K, D]>;
    [Symbol.toStringTag]: string;
    makeCollectionKey: (item: S) => K;
    makeRdo(sourceItem: S, parentRdoNodeWrapper: IRdoNodeWrapper<K, S, D>): D | undefined;
    elements(): Iterable<D>;
    patchAdd(patchOp: CollectionNodePatchOperation<K, D>): void;
    patchDelete(patchOp: Omit<CollectionNodePatchOperation<K, D>, 'op'>): void;
}
