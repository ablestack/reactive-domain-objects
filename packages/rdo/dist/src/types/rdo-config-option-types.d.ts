import { IEqualityComparer, IMakeRdo, IMakeCollectionKeyMethod } from '.';
export interface IGraphSynchronizer {
    smartSync<S extends Record<string, any>, D extends Record<string, any>>({ rootSourceNode, rootRdo }: {
        rootSourceNode: S;
        rootRdo: D;
    }): any;
}
export interface IGraphSyncOptions {
    customEqualityComparer?: IEqualityComparer;
    globalNodeOptions?: IGlobalNameOptions;
    targetedNodeOptions?: Array<INodeSyncOptions<any, any>>;
}
export interface IGlobalNameOptions {
    commonRdoFieldnamePostfix?: string;
    tryGetRdoFieldname?: ({ sourceNodePath, sourceFieldname, sourceFieldVal }: {
        sourceNodePath: string;
        sourceFieldname: string;
        sourceFieldVal: any;
    }) => string;
}
export interface INodeSyncOptions<S, D> {
    sourceNodeMatcher: INodeSelector<S>;
    ignore?: boolean;
    makeRdoCollectionKey?: {
        fromSourceElement: IMakeCollectionKeyMethod<S>;
        fromRdoElement: IMakeCollectionKeyMethod<D>;
    };
    makeRdo?: IMakeRdo<S, D>['makeRdo'];
}
export interface INodeSelector<S> {
    nodePath?: string;
    nodeContent?: (sourceNode: S) => boolean;
}
