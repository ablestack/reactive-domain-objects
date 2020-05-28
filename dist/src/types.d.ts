export interface ISyncableObject<S extends object> {
    lastSourceData: S | null | undefined;
    synchronizeState?(sourceItem: S | null | undefined): void;
    areEqual?(currentSourceItem: S | null | undefined, lastSourceItem: S | null | undefined): boolean;
}
export declare function isISyncableObject(o: any): o is ISyncableObject<any>;
