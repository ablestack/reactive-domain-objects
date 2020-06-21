import { IEqualityComparer, IMakeRdo, MakeCollectionKeyMethod } from '.';
export interface IGraphSynchronizer<K extends string = string> {
    smartSync<S extends Record<K, any>, D extends Record<K, any>>({ rootSourceNode, rootRdo }: {
        rootSourceNode: S;
        rootRdo: D;
    }): any;
}
export interface IGraphSyncOptions {
    customEqualityComparer?: IEqualityComparer;
    globalNodeOptions?: IGlobalNodeOptions;
    targetedNodeOptions?: Array<INodeSyncOptions<any, any, any>>;
}
export declare type autoMakeRdoAsTypes = 'plain-object-literals' | 'mobx-observable-object-literals';
export interface IGlobalNodeOptions {
    commonRdoFieldnamePostfix?: string;
    tryGetRdoFieldname?: <K extends string | number | symbol>({ sourceNodePath, sourceFieldname, sourceFieldVal }: {
        sourceNodePath: string;
        sourceFieldname: K;
        sourceFieldVal: any;
    }) => K | undefined;
    makeRdo?: IMakeRdo<any, any, any>['makeRdo'];
    autoMakeRdoTypes?: {
        objectFields: boolean;
        collectionElements: boolean;
        as: autoMakeRdoAsTypes;
    };
}
export interface INodeSyncOptions<K extends string | number | symbol, S, D> {
    sourceNodeMatcher: INodeSelector<S>;
    ignore?: boolean;
    makeRdoCollectionKey?: {
        fromSourceElement: MakeCollectionKeyMethod<K, S>;
        fromRdoElement: MakeCollectionKeyMethod<K, D>;
    };
    makeRdo?: IMakeRdo<K, S, D>['makeRdo'];
}
export interface INodeSelector<S> {
    nodePath?: string;
    nodeContent?: (sourceNode: S) => boolean;
}
