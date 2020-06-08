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
 * use case where a `fromDomainNode` factory does not need to be supplied, but in all user-config supplied
 * use cases, require both `fromSourceNode` and `fromDomainNode` for a DomainNodeKeyFactory config
 *
 *****************************************************************************/
export interface INodeSyncOptionsStrict<S, D> {
    sourceNodeMatcher: INodeSelector<S>;
    ignore?: boolean;
    domainCollection?: IDomainModelFactory<S, D>;
}
export interface INodeSyncOptions<S, D> {
    sourceNodeMatcher: INodeSelector<S>;
    ignore?: boolean;
    domainCollection?: IDomainModelFactory<S, D>;
}
export interface INodeSyncOptionsStrict<S, D> {
    sourceNodeMatcher: INodeSelector<S>;
    ignore?: boolean;
    domainCollection?: IDomainModelFactory<S, D>;
}
export interface INodeSelector<S> {
    nodePath?: string;
    nodeContent?: (sourceNode: S) => boolean;
}
export interface IMakeKey<T> {
    (item: T): string;
}
export interface IMakeDomainModel<S, D> {
    (sourceObject: S): D;
}
export interface IDomainModelFactory<S, D> {
    makeCollectionKey?: IDomainNodeKeyFactory<S, D>;
    makeDomainModel: IMakeDomainModel<S, D>;
}
export interface IDomainModelFactoryStrict<S, D> {
    makeCollectionKey?: IDomainNodeKeyFactoryStrict<S, D>;
    makeDomainModel: IMakeDomainModel<S, D>;
}
export interface IDomainNodeKeyFactoryStrict<S, D> {
    fromSourceNode: IMakeKey<S>;
    fromDomainNode: IMakeKey<D>;
}
export interface IDomainNodeKeyFactory<S, D> {
    fromSourceNode: IMakeKey<S>;
    fromDomainNode?: IMakeKey<D>;
}
export declare function IsIDomainModelFactory(o: any): o is IDomainModelFactory<any, any>;
export interface ISyncableCollection<T> extends Iterable<T> {
    readonly size: number;
    getKeys: () => string[];
    tryGetItemFromTargetCollection: (key: string) => T | null | undefined;
    insertItemToTargetCollection: (key: string, value: T) => void;
    updateItemInTargetCollection: (key: string, value: T) => void;
    tryDeleteItemFromTargetCollection: (key: string) => void;
    clear: () => void;
}
export declare function IsISyncableCollection(o: any): boolean;
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
    afterSyncIfNeeded: ({ sourceObject, syncAttempted, domainModelChanged }: {
        sourceObject: S;
        syncAttempted: boolean;
        domainModelChanged: boolean;
    }) => void;
}
export declare function IsIAfterSyncIfNeeded(o: any): o is IAfterSyncIfNeeded<any>;
export interface ICustomEqualityDomainModel<S> {
    isStateEqual: IStateEqual<S>;
}
export declare function IsICustomEqualityDomainModel(o: any): o is ICustomEqualityDomainModel<any>;
export interface IEqualityComparer {
    (a: any, b: any): boolean;
}
