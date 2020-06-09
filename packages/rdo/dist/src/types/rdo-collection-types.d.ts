export interface IMakeRdoCollectionKey<T> {
    (item: T): string;
}
export interface IMakeRDO<S, D> {
    (sourceObject: S): D;
}
export interface IRdoCollectionKeyFactoryStrict<S, D> {
    fromSourceElement: IMakeRdoCollectionKey<S>;
    fromRdoElement: IMakeRdoCollectionKey<D>;
}
export interface IRdoCollectionKeyFactory<S, D> {
    fromSourceElement: IMakeRdoCollectionKey<S>;
    fromRdoElement?: IMakeRdoCollectionKey<D>;
}
export interface ISyncableCollection<T> extends Iterable<T> {
    readonly size: number;
    getKeys: () => string[];
    tryGetItemFromTargetCollection: (key: string) => T | null | undefined;
    insertItemToTargetCollection: (key: string, value: T) => void;
    updateItemInTargetCollection: (key: string, value: T) => void;
    tryDeleteItemFromTargetCollection: (key: string) => void;
    clear: () => void;
}
export declare function IsISyncableCollection(o: any): o is ISyncableCollection<any>;
export interface ISyncableRDOCollection<S, D> extends ISyncableCollection<D> {
    makeRdoCollectionKey?: IRdoCollectionKeyFactoryStrict<S, D>;
    makeRdo: IMakeRDO<S, D>;
}
export declare function IsISyncableRDOCollection(o: any): o is ISyncableRDOCollection<any, any>;
/***************************************************************************
 * NOTES:
 *
 * Node Sync Options
 *
 * We have *Strict interfaces is because we want to support one internal
 * use case where a `fromRdoElement` factory does not need to be supplied, but in all user-config supplied
 * use cases, require both `fromSourceElement` and `fromRdoElement` for a DomainNodeKeyFactory config
 *
 *****************************************************************************/
