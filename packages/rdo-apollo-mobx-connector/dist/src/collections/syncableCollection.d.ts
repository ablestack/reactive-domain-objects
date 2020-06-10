import { ISyncableRDOCollection } from '@ablestack/rdo';
export declare class SyncableCollection<S, D> implements ISyncableRDOCollection<S, D>, Map<string, D> {
    private _makeRdoCollectionKeyFromSourceElement;
    private _makeRdoCollectionKeyFromRdoElement;
    private _makeRdo;
    private _map$;
    get size(): number;
    private _array$;
    get array$(): Array<D>;
    constructor({ makeRdoCollectionKeyFromSourceElement, makeRdoCollectionKeyFromRdoElement, makeRdo, }: {
        makeRdoCollectionKeyFromSourceElement: (sourceNode: S) => string;
        makeRdoCollectionKeyFromRdoElement: (rdo: D) => string;
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
    makeRdoCollectionKeyFromSourceElement: (sourceNode: S) => string;
    makeRdoCollectionKeyFromRdoElement: (rdo: D) => string;
    makeRdo: (sourceItem: S) => D;
    getKeys: () => string[];
    tryGetItemFromTargetCollection: (key: string) => D | undefined;
    insertItemToTargetCollection: (key: string, value: D) => void;
    updateItemInTargetCollection: (key: string, value: D) => void;
    tryDeleteItemFromTargetCollection: (key: string) => boolean;
    clear: () => void;
}
