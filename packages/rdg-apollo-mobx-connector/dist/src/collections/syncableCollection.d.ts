import { ISyncableRDOCollection } from '@ablestack/rdg';
export declare class SyncableCollection<S extends object, D extends object> implements ISyncableRDOCollection<S, D> {
    private _makeRDOCollectionKeyFromSourceElement;
    private _makeRDOCollectionKeyFromDomainElement;
    private _makeRDO;
    private _map$;
    get size(): number;
    get map$(): Map<string, D>;
    private _array$;
    get array$(): Array<D>;
    constructor({ makeRDOCollectionKeyFromSourceElement, makeRDOCollectionKeyFromDomainElement, makeRDO, }: {
        makeRDOCollectionKeyFromSourceElement: (sourceNode: S) => string;
        makeRDOCollectionKeyFromDomainElement: (domainNode: D) => string;
        makeRDO: (sourceNode: S) => D;
    });
    makeRDOCollectionKeyFromSourceElement: (sourceNode: S) => string;
    makeRDOCollectionKeyFromDomainElement: (domainNode: D) => string;
    makeRDO: (sourceItem: S) => D;
    [Symbol.iterator](): Iterator<D>;
    getKeys: () => string[];
    tryGetItemFromTargetCollection: (key: string) => D | undefined;
    insertItemToTargetCollection: (key: string, value: D) => void;
    updateItemInTargetCollection: (key: string, value: D) => void;
    tryDeleteItemFromTargetCollection: (key: string) => void;
    clear: () => void;
}
