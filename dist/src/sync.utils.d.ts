import { ISyncableObject } from '.';
declare function areEqual(sourceItem: any, syncableObject: ISyncableObject<any>): boolean;
/** */
declare function autoSynchronize<S extends Record<string, any>>({ rootSourceData, rootSyncableObject }: {
    rootSourceData: S;
    rootSyncableObject: ISyncableObject<S>;
}): void;
export declare const SyncUtils: {
    autoSynchronize: typeof autoSynchronize;
    areEqual: typeof areEqual;
};
export {};
