import { ISyncableRDOCollection } from '@ablestack/rdo';
export declare class SyncableCollection<S extends object, D extends object> implements ISyncableRDOCollection<S, D> {
    private _makeRdoCollectionKeyFromSourceElement;
    private _makeRdoCollectionKeyFromRdoElement;
    private _makeRdo;
    private _map$;
    get size(): number;
    get map$(): Map<string, D>;
    private _array$;
    get array$(): Array<D>;
    constructor({ makeRdoCollectionKeyFromSourceElement, makeRdoCollectionKeyFromRdoElement, makeRdo, }: {
        makeRdoCollectionKeyFromSourceElement: (sourceNode: S) => string;
        makeRdoCollectionKeyFromRdoElement: (rdo: D) => string;
        makeRdo: (sourceNode: S) => D;
    });
    makeRdoCollectionKeyFromSourceElement: (sourceNode: S) => string;
    makeRdoCollectionKeyFromRdoElement: (rdo: D) => string;
    makeRdo: (sourceItem: S) => D;
    [Symbol.iterator](): Iterator<D>;
    getKeys: () => string[];
    tryGetItemFromTargetCollection: (key: string) => D | undefined;
    insertItemToTargetCollection: (key: string, value: D) => void;
    updateItemInTargetCollection: (key: string, value: D) => void;
    tryDeleteItemFromTargetCollection: (key: string) => void;
    clear: () => void;
}
