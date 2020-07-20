import { IRdoNodeWrapper, ISyncableRDOKeyBasedCollection, MakeCollectionKeyMethod } from '..';
/**
 *
 *
 * @export
 * @class ListMap
 * @implements {ISyncableRDOKeyBasedCollection<S, D>}
 * @implements {Map<K, D>}
 * @template S
 * @template D
 * @description: A readonly, syncable, Map-Array collection hybrid, with an built in observable array (accessed via array$). Manages the internal array in parallel with the internal map so as to only trigger observable changes when necessary
 */
export declare class ListMap<K extends string | number, S, D> implements ISyncableRDOKeyBasedCollection<K, S, D> {
    private _map$;
    private indexByKeyMap;
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
    elements(): Iterable<D>;
    handleNewKey: ({ index, key, nextRdo }: {
        index?: number | undefined;
        key: K;
        nextRdo: any;
    }) => boolean;
    handleReplaceKey: ({ index, key, lastRdo, nextRdo }: {
        index?: number | undefined;
        key: K;
        lastRdo: any;
        nextRdo: any;
    }) => boolean;
    handleDeleteKey: ({ index, key, lastRdo }: {
        index?: number | undefined;
        key: K;
        lastRdo: any;
    }) => boolean;
    tryMakeCollectionKey(item: S, index: number): K | undefined;
    makeRdo(sourceItem: S, parentRdoNodeWrapper: IRdoNodeWrapper<K, S, D>): D | undefined;
}
