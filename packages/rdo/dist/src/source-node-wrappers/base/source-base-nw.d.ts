import { ISourceNodeWrapper, NodeTypeInfo, INodeSyncOptions, IGlobalNodeOptions, IRdoNodeWrapper } from '../..';
export declare abstract class SourceBaseNW<K extends string | number, S, D> implements ISourceNodeWrapper<K, S, D> {
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
        key: K | undefined;
        typeInfo: NodeTypeInfo;
        matchingNodeOptions: INodeSyncOptions<any, any, any> | undefined;
        globalNodeOptions: IGlobalNodeOptions | undefined;
    });
    get typeInfo(): NodeTypeInfo;
    get key(): K | undefined;
    get sourceNodeTypePath(): string;
    get sourceNodeInstancePath(): string;
    get matchingNodeOptions(): INodeSyncOptions<any, any, any> | undefined;
    get globalNodeOptions(): IGlobalNodeOptions | undefined;
    get wrappedRdoNode(): IRdoNodeWrapper<K, S, any> | undefined;
    setRdoNode(rdoNode: IRdoNodeWrapper<K, S, any>): void;
    abstract childElementCount(): number;
    abstract get value(): any;
}
