import { ISourceNodeWrapper, SourceNodeTypeInfo, INodeSyncOptions, IGlobalNameOptions, IRdoNodeWrapper } from '../..';
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
        typeInfo: SourceNodeTypeInfo;
        lastSourceNode: any;
        matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
        globalNodeOptions: IGlobalNameOptions | undefined;
    });
    get typeInfo(): SourceNodeTypeInfo;
    get key(): string | undefined;
    get sourceNodePath(): string;
    get lastSourceNode(): S | undefined;
    get matchingNodeOptions(): INodeSyncOptions<any, any> | undefined;
    get globalNodeOptions(): IGlobalNameOptions | undefined;
    get wrappedRdoNode(): IRdoNodeWrapper<S, any> | undefined;
    setRdoNode(rdoNode: IRdoNodeWrapper<S, any>): void;
    abstract childElementCount(): number;
    abstract get value(): any;
}
