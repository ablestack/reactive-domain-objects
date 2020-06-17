import { ISyncableRDOCollection, MakeCollectionKeyMethod, IRdoNodeWrapper } from '@ablestack/rdo';
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
export declare class SyncableCollection<S, D> implements ISyncableRDOCollection<S, D>, Map<string, D> {
    private _map$;
    private _makeCollectionKeyFromSourceElement?;
    private _makeCollectionKeyFromRdoElement?;
    private _makeRdo?;
    get size(): number;
    private _array$;
    get array$(): Array<D>;
    constructor({ makeCollectionKeyFromSourceElement, makeCollectionKeyFromRdoElement, makeRdo, }?: {
        makeCollectionKeyFromSourceElement?: MakeCollectionKeyMethod<S>;
        makeCollectionKeyFromRdoElement?: MakeCollectionKeyMethod<D>;
        makeRdo?: (sourceNode: S) => D;
    });
    delete(key: string): boolean;
    forEach(callbackfn: (value: D, key: string, map: Map<string, D>) => void, thisArg?: any): void;
    get(key: string): D | undefined;
    has(key: string): boolean;
    set(key: string, value: D): this;
    entries(): IterableIterator<[string, D]>;
    keys(): IterableIterator<string>;
    values(): IterableIterator<D>;
    clear(): void;
    [Symbol.iterator](): IterableIterator<[string, D]>;
    [Symbol.toStringTag]: string;
    makeCollectionKeyFromSourceElement: (item: S) => string | undefined;
    makeCollectionKeyFromRdoElement: (item: D) => string | undefined;
    makeRdo(sourceItem: S, parentRdoNodeWrapper: IRdoNodeWrapper<S, D>): D | undefined;
    getCollectionKeys: () => string[];
    elements(): Iterable<D>;
    getElement: (key: string) => D | undefined;
    insertElement: (key: string, value: D) => boolean;
    updateElement: (key: string, value: D) => boolean;
    deleteElement: (key: string) => boolean;
    clearElements: () => boolean;
}
