import { ISyncableRDOCollection } from '@ablestack/rdo';
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
export declare class SyncableCollection<S, D> implements ISyncableRDOCollection<S, D>, Map<string, D> {
    private _map$;
    makeRdoCollectionKeyFromSourceElement?: (node: S) => string;
    makeRdoCollectionKeyFromRdoElement?: (node: D) => string;
    makeRdo: (sourceItem: S) => D;
    get size(): number;
    private _array$;
    get array$(): Array<D>;
    constructor({ makeRdoCollectionKeyFromSourceElement, makeRdoCollectionKeyFromRdoElement, makeRdo, }: {
        makeRdoCollectionKeyFromSourceElement?: (sourceNode: S) => string;
        makeRdoCollectionKeyFromRdoElement?: (rdo: D) => string;
        makeRdo: (sourceNode: S) => D;
    });
    delete(key: string): boolean;
    forEach(callbackfn: (value: D, key: string, map: Map<string, D>) => void, thisArg?: any): void;
    get(key: string): D | undefined;
    has(key: string): boolean;
    set(key: string, value: D): this;
    [Symbol.iterator](): IterableIterator<[string, D]>;
    entries(): IterableIterator<[string, D]>;
    keys(): IterableIterator<string>;
    values(): IterableIterator<D>;
    [Symbol.toStringTag]: string;
    getKeys: () => string[];
    tryGetItemFromTargetCollection: (key: string) => D | undefined;
    insertItemToTargetCollection: (key: string, value: D) => void;
    updateItemInTargetCollection: (key: string, value: D) => void;
    tryDeleteItemFromTargetCollection: (key: string) => boolean;
    clear: () => void;
}
