export interface IHasCustomRdoFieldNames<S extends Record<string, any>, D extends Record<string, any>> {
    tryGetRdoFieldname: ({ sourceNodePath, sourceFieldname, sourceFieldVal }: {
        sourceNodePath: string;
        sourceFieldname: string;
        sourceFieldVal: any;
    }) => string | undefined;
}
export declare function IsIHasCustomRdoFieldNames(o: any): o is IHasCustomRdoFieldNames<any, any>;
export interface ICustomSync<S> {
    synchronizeState: ({ sourceObject, continueSmartSync }: {
        sourceObject: S;
        continueSmartSync: IContinueSmartSync;
    }) => boolean;
}
export interface IContinueSmartSync {
    ({ sourceNodeSubPath, sourceObject, rdo }: {
        sourceNodeSubPath: string;
        sourceObject: Record<string, any>;
        rdo: Record<string, any>;
    }): boolean;
}
export declare function IsICustomSync(o: any): o is ICustomSync<any>;
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
