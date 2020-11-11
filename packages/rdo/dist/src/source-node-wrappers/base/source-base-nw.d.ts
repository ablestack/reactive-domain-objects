import { ISourceNodeWrapper, NodeTypeInfo, INodeSyncOptions, IGlobalNodeOptions, IRdoNodeWrapper } from '../..';
export declare abstract class SourceBaseNW<S, D> implements ISourceNodeWrapper<S, D> {
    private _key;
    private _typeInfo;
    private _sourceNodeTypePath;
    private _sourceNodeInstancePath;
    private _matchingNodeOptions;
    private _globalNodeOptions;
    private _wrappedRdoNode;
    constructor({ sourceNodeTypePath, sourceNodeInstancePath, key, typeInfo, matchingNodeOptions, globalNodeOptions, }: {
        sourceNodeTypePath: string;
        sourceNodeInstancePath: string;
        key: string | number | undefined;
        typeInfo: NodeTypeInfo;
        matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
        globalNodeOptions: IGlobalNodeOptions | undefined;
    });
    get typeInfo(): NodeTypeInfo;
    get key(): string | number | undefined;
    get sourceNodeTypePath(): string;
    get sourceNodeInstancePath(): string;
    get matchingNodeOptions(): INodeSyncOptions<any, any> | undefined;
    get globalNodeOptions(): IGlobalNodeOptions | undefined;
    get wrappedRdoNode(): IRdoNodeWrapper<S, any> | undefined;
    setRdoNode(rdoNode: IRdoNodeWrapper<S, any>): void;
    abstract childElementCount(): number;
    abstract get value(): any;
}
