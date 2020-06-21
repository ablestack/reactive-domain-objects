import { ISyncableRDOCollection, MakeCollectionKeyMethod, IRdoNodeWrapper } from '..';
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
export declare class SyncableCollection<K extends string | number | symbol, S, D> implements ISyncableRDOCollection<K, S, D>, Map<K, D> {
    private _map$;
    private _makeCollectionKeyFromSourceElement?;
    private _makeCollectionKeyFromRdoElement?;
    private _makeRdo?;
    get size(): number;
    private _array$;
    get array$(): Array<D>;
    constructor({ makeCollectionKeyFromSourceElement, makeCollectionKeyFromRdoElement, makeRdo, }?: {
        makeCollectionKeyFromSourceElement?: MakeCollectionKeyMethod<K, S>;
        makeCollectionKeyFromRdoElement?: MakeCollectionKeyMethod<K, D>;
        makeRdo?: (sourceNode: S) => D;
    });
    delete(key: K): boolean;
    forEach(callbackfn: (value: D, key: K, map: Map<K, D>) => void, thisArg?: any): void;
    get(key: K): D | undefined;
    has(key: K): boolean;
    set(key: K, value: D): this;
    entries(): IterableIterator<[K, D]>;
    keys(): IterableIterator<K>;
    values(): IterableIterator<D>;
    clear(): void;
    [Symbol.iterator](): IterableIterator<[K, D]>;
    [Symbol.toStringTag]: string;
    makeCollectionKeyFromSourceElement: (item: S) => K | undefined;
    makeCollectionKeyFromRdoElement: (item: D) => K | undefined;
    makeRdo(sourceItem: S, parentRdoNodeWrapper: IRdoNodeWrapper<K, S, D>): D | undefined;
    getCollectionKeys: () => K[];
    elements(): Iterable<D>;
    getElement: (key: K) => D | undefined;
    insertElement: (key: K, value: D) => boolean;
    updateElement: (key: K, value: D) => boolean;
    deleteElement: (key: K) => D | undefined;
    clearElements: () => boolean;
}
