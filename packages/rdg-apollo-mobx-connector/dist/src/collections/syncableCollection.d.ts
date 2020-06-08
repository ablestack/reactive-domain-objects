import { IDomainModelFactory, ISyncableCollection } from '@ablestack/rdg';
export declare class SyncableCollection<S extends object, D extends object> implements IDomainModelFactory<S, D>, ISyncableCollection<D> {
    private _makeDomainNodeKeyFromSourceNode;
    private _makeDomainNodeKeyFromDomainNode;
    private _makeDomainModel;
    private _map$;
    get size(): number;
    get map$(): Map<string, D>;
    private _array$;
    get array$(): Array<D>;
    constructor({ makeDomainNodeKeyFromSourceNode, makeDomainNodeKeyFromDomainNode, makeDomainModel, }: {
        makeDomainNodeKeyFromSourceNode: (sourceNode: S) => string;
        makeDomainNodeKeyFromDomainNode: (domainNode: D) => string;
        makeDomainModel: (sourceNode: S) => D;
    });
    makeDomainNodeKeyFromSourceNode: (sourceNode: S) => string;
    makeDomainNodeKeyFromDomainNode: (domainNode: D) => string;
    makeDomainModel: (sourceItem: S) => D;
    [Symbol.iterator](): Iterator<D>;
    getKeys: () => string[];
    tryGetItemFromTargetCollection: (key: string) => D | undefined;
    insertItemToTargetCollection: (key: string, value: D) => void;
    updateItemInTargetCollection: (key: string, value: D) => void;
    tryDeleteItemFromTargetCollection: (key: string) => void;
    clear: () => void;
}
