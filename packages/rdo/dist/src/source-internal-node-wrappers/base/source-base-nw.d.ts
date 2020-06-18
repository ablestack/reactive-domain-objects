import { ISourceNodeWrapper, NodeTypeInfo, INodeSyncOptions, IGlobalNodeOptions, IRdoNodeWrapper } from '../..';
export declare abstract class SourceBaseNW<S> implements ISourceNodeWrapper<S> {
    private _key;
    private _typeInfo;
    private _sourceNodePath;
    private _lastSourceNode;
    private _matchingNodeOptions;
    private _globalNodeOptions;
    private _wrappedRdoNode;
    constructor({ sourceNodePath, key, typeInfo, lastSourceNode, matchingNodeOptions, globalNodeOptions, }: {
        sourceNodePath: string;
        key: string | undefined;
        typeInfo: NodeTypeInfo;
        lastSourceNode: any;
        matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
        globalNodeOptions: IGlobalNodeOptions | undefined;
    });
    get typeInfo(): NodeTypeInfo;
    get key(): string | undefined;
    get sourceNodePath(): string;
    get lastSourceNode(): S | undefined;
    get matchingNodeOptions(): INodeSyncOptions<any, any> | undefined;
    get globalNodeOptions(): IGlobalNodeOptions | undefined;
    get wrappedRdoNode(): IRdoNodeWrapper<S, any> | undefined;
    setRdoNode(rdoNode: IRdoNodeWrapper<S, any>): void;
    abstract childElementCount(): number;
    abstract get value(): any;
}
