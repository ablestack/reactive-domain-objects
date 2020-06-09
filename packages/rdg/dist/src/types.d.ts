export declare type JavaScriptBuiltInType = '[object Array]' | '[object Boolean]' | '[object Date]' | '[object Error]' | '[object Map]' | '[object Number]' | '[object Object]' | '[object RegExp]' | '[object Set]' | '[object String]' | '[object Undefined]';
export declare type JsonNodeKind = 'objectProperty' | 'arrayElement';
export declare type SourceNodeType = 'Primitive' | 'Array' | 'Object';
export declare type SourceNodeTypeInfo = {
    type: SourceNodeType | undefined;
    builtInType: JavaScriptBuiltInType;
};
export declare type DomainNodeType = 'Primitive' | 'Array' | 'Map' | 'Set' | 'ISyncableCollection' | 'Object';
export declare type DomainNodeTypeInfo = {
    type: DomainNodeType | undefined;
    builtInType: JavaScriptBuiltInType;
};
export interface IGraphSynchronizer {
    smartSync<S extends Record<string, any>, D extends Record<string, any>>({ rootSourceNode, rootDomainNode }: {
        rootSourceNode: S;
        rootDomainNode: D;
    }): any;
}
export interface IGraphSyncOptions {
    customEqualityComparer?: IEqualityComparer;
    globalNodeOptions?: IGlobalPropertyNameTransformation;
    targetedNodeOptions?: Array<INodeSyncOptionsStrict<any, any>>;
}
export interface IGlobalPropertyNameTransformation {
    commonDomainFieldnamePostfix?: string;
    computeDomainFieldname?: ({ sourceNodePath, sourcePropKey, sourcePropVal }: {
        sourceNodePath: string;
        sourcePropKey: string;
        sourcePropVal: any;
    }) => string;
}
/***************************************************************************
 * Node Sync Options
 *
 * We have *Strict interfaces is because we want to support one internal
 * use case where a `fromDomainElement` factory does not need to be supplied, but in all user-config supplied
 * use cases, require both `fromSourceElement` and `fromDomainElement` for a DomainNodeKeyFactory config
 *
 *****************************************************************************/
export interface INodeSyncOptions<S, D> {
    sourceNodeMatcher: INodeSelector<S>;
    ignore?: boolean;
    makeRDOCollectionKey?: IDomainNodeKeyFactory<S, D>;
    makeRDO?: IMakeRDO<S, D>;
}
export interface INodeSyncOptionsStrict<S, D> {
    sourceNodeMatcher: INodeSelector<S>;
    ignore?: boolean;
    makeRDOCollectionKey?: IDomainNodeKeyFactoryStrict<S, D>;
    makeRDO?: IMakeRDO<S, D>;
}
export interface INodeSelector<S> {
    nodePath?: string;
    nodeContent?: (sourceNode: S) => boolean;
}
export interface IMakeKey<T> {
    (item: T): string;
}
export interface IMakeRDO<S, D> {
    (sourceObject: S): D;
}
export interface IDomainNodeKeyFactoryStrict<S, D> {
    fromSourceElement: IMakeKey<S>;
    fromDomainElement: IMakeKey<D>;
}
export interface IDomainNodeKeyFactory<S, D> {
    fromSourceElement: IMakeKey<S>;
    fromDomainElement?: IMakeKey<D>;
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
    makeRDOCollectionKey?: IDomainNodeKeyFactoryStrict<S, D>;
    makeRDO: IMakeRDO<S, D>;
}
export declare function IsISyncableRDOCollection(o: any): o is ISyncableRDOCollection<any, any>;
export interface ISynchronizeState<S> {
    ({ sourceObject, graphSynchronizer }: {
        sourceObject: S | null | undefined;
        graphSynchronizer: IGraphSynchronizer;
    }): boolean;
}
export interface IStateEqual<S> {
    (sourceObject: S | null | undefined, previousSourceObject: S | null | undefined): boolean;
}
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
export interface ICustomSync<S> {
    synchronizeState: ISynchronizeState<S>;
}
export declare function IsICustomSync(o: any): o is ICustomSync<any>;
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
export interface ICustomEqualityRDO<S> {
    isStateEqual: IStateEqual<S>;
}
export declare function IsICustomEqualityRDO(o: any): o is ICustomEqualityRDO<any>;
export interface IEqualityComparer {
    (a: any, b: any): boolean;
}
