import { IRdoNodeWrapper, RdoNodeTypeInfo, ISourceNodeWrapper, IGlobalNameOptions, INodeSyncOptions } from '../..';
export declare abstract class RdoNWBase<S, D> implements IRdoNodeWrapper<S, D> {
    private _typeInfo;
    private _key;
    private _parent;
    private _wrappedSourceNode;
    private _matchingNodeOptions;
    private _globalNodeOptions;
    constructor({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, matchingNodeOptions, globalNodeOptions, }: {
        typeInfo: RdoNodeTypeInfo;
        key: string | undefined;
        wrappedParentRdoNode: IRdoNodeWrapper<S, D> | undefined;
        wrappedSourceNode: ISourceNodeWrapper<S>;
        matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
        globalNodeOptions: IGlobalNameOptions | undefined;
    });
    get ignore(): boolean;
    get key(): string | undefined;
    get wrappedParentRdoNode(): IRdoNodeWrapper<S, D> | undefined;
    get typeInfo(): RdoNodeTypeInfo;
    get wrappedSourceNode(): ISourceNodeWrapper<S>;
    get matchingNodeOptions(): INodeSyncOptions<any, any> | undefined;
    get globalNodeOptions(): IGlobalNameOptions | undefined;
    abstract get value(): any;
    abstract smartSync(): any;
    abstract childElementCount(): any;
}
