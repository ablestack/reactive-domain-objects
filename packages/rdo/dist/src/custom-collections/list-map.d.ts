import { IRdoNodeWrapper, ISyncableRDOKeyBasedCollection, MakeCollectionKeyMethod } from '..';
/**
 *
 *
 * @export
 * @class ListMap
 * @implements {ISyncableRDOKeyBasedCollection<S, D>}
 * @implements {Map<string | number, D>}
 * @template S
 * @template D
 * @description: A readonly, syncable, Map-Array collection hybrid, with an built in observable array (accessed via array$). Manages the internal array in parallel with the internal map so as to only trigger observable changes when necessary
 */
export declare class ListMap<S, D> implements ISyncableRDOKeyBasedCollection<S, D> {
    private _map$;
    private indexByKeyMap;
    private _makeCollectionKey?;
    private _makeRdo?;
    get size(): number;
    private _array$;
    get array$(): Array<D>;
    constructor({ makeCollectionKey, makeRdo, }?: {
        makeCollectionKey?: MakeCollectionKeyMethod<S>;
        makeRdo?: (sourceNode: S) => D;
    });
    forEach(callbackfn: (value: D, key: string | number, map: Map<string | number, D>) => void, thisArg?: any): void;
    get(key: string | number): D | undefined;
    has(key: string | number): boolean;
    entries(): IterableIterator<[string | number, D]>;
    keys(): IterableIterator<string | number>;
    values(): IterableIterator<D>;
    [Symbol.iterator](): IterableIterator<[string | number, D]>;
    [Symbol.toStringTag]: string;
    elements(): Iterable<D>;
    handleNewKey: ({ index, key, nextRdo }: {
        index?: number | undefined;
        key: string | number;
        nextRdo: any;
    }) => boolean;
    handleReplaceKey: ({ index, key, lastRdo, nextRdo }: {
        index?: number | undefined;
        key: string | number;
        lastRdo: any;
        nextRdo: any;
    }) => boolean;
    handleDeleteKey: ({ index, key, lastRdo }: {
        index?: number | undefined;
        key: string | number;
        lastRdo: any;
    }) => boolean;
    tryMakeCollectionKey(item: S, index: number): string | number | undefined;
    makeRdo(sourceItem: S, parentRdoNodeWrapper: IRdoNodeWrapper<S, D>): D | undefined;
}
