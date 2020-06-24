export interface IHasCustomRdoFieldNames<K extends string> {
    tryGetRdoFieldname: ({ sourceNodeTypePath, sourceFieldname, sourceFieldVal }: {
        sourceNodeTypePath: string;
        sourceFieldname: K;
        sourceFieldVal: any;
    }) => K | undefined;
}
export declare function IsIHasCustomRdoFieldNames(o: any): o is IHasCustomRdoFieldNames<any>;
export interface ICustomSync<S> {
    synchronizeState: ({ sourceObject, continueSmartSync }: {
        sourceObject: S;
        continueSmartSync: IContinueSmartSync;
    }) => boolean;
}
export declare function IsICustomSync(o: any): o is ICustomSync<any>;
export declare type IContinueSmartSync = <K extends string | number, S, D>(smartSyncProps: SmartSyncProps<K, S, D>) => boolean;
export declare type SmartSyncProps<K, S, D> = {
    sourceNodeItemKey: K;
    sourceItemValue: S;
    rdoNodeItemKey: K;
    rdoNodeItemValue: D;
    sourceNodeSubPath?: string;
};
export interface ICustomEqualityRDO<S> {
    isStateEqual: (sourceObject: S | null | undefined, previousSourceObject: S | null | undefined) => boolean;
}
export declare function IsICustomEqualityRDO(o: any): o is ICustomEqualityRDO<any>;
export interface IBeforeSyncIfNeeded<S> {
    beforeSyncIfNeeded: ({ sourceObject, isSyncNeeded }: {
        sourceObject: S;
        isSyncNeeded: boolean;
    }) => void;
}
export declare function IsIBeforeSyncIfNeeded(o: any): o is IBeforeSyncIfNeeded<any>;
export interface IBeforeSyncUpdate<S> {
    beforeSyncUpdate: ({ sourceObject }: {
        sourceObject: S;
    }) => void;
}
export declare function IsIBeforeSyncUpdate(o: any): o is IBeforeSyncUpdate<any>;
export interface IAfterSyncUpdate<S> {
    afterSyncUpdate: ({ sourceObject }: {
        sourceObject: S;
    }) => void;
}
export declare function IsIAfterSyncUpdate(o: any): o is IAfterSyncUpdate<any>;
export interface IAfterSyncIfNeeded<S> {
    afterSyncIfNeeded: ({ sourceObject, syncAttempted, RDOChanged }: {
        sourceObject: S;
        syncAttempted: boolean;
        RDOChanged: boolean;
    }) => void;
}
export declare function IsIAfterSyncIfNeeded(o: any): o is IAfterSyncIfNeeded<any>;
