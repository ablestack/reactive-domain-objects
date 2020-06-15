import { IEqualityComparer, IGlobalNameOptions, INodeSyncOptions, IRdoNodeWrapper, ISourceNodeWrapper, ISyncChildNode, IWrapRdoNode, RdoNodeTypes } from '..';
export declare class RdoNodeWrapperFactory {
    private _syncChildNode;
    private _globalNodeOptions;
    private _wrapRdoNode;
    private _defaultEqualityComparer;
    constructor({ syncChildNode, globalNodeOptions, wrapRdoNode, defaultEqualityComparer, }: {
        syncChildNode: ISyncChildNode<any, any>;
        globalNodeOptions: IGlobalNameOptions | undefined;
        wrapRdoNode: IWrapRdoNode;
        defaultEqualityComparer: IEqualityComparer;
    });
    make<S, D>({ value, key, wrappedParentRdoNode, wrappedSourceNode, matchingNodeOptions, }: {
        value: RdoNodeTypes<S, D>;
        key: string | undefined;
        wrappedParentRdoNode: IRdoNodeWrapper<S, D> | undefined;
        wrappedSourceNode: ISourceNodeWrapper<S>;
        matchingNodeOptions?: INodeSyncOptions<any, any> | undefined;
    }): IRdoNodeWrapper<S, D>;
}
