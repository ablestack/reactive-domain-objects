import { ISourceNodeWrapper, NodeTypeInfo, INodeSyncOptions, IGlobalNodeOptions, IRdoNodeWrapper } from '../..';
export declare abstract class SourceBaseNW<K extends string | number, S, D> implements ISourceNodeWrapper<K, S, D> {
    private _key;
    private _typeInfo;
    private _sourceNodePath;
    private _matchingNodeOptions;
    private _globalNodeOptions;
    private _wrappedRdoNode;
    constructor({ sourceNodePath, key, typeInfo, matchingNodeOptions, globalNodeOptions, }: {
        sourceNodePath: string;
        key: K | undefined;
        typeInfo: NodeTypeInfo;
        matchingNodeOptions: INodeSyncOptions<any, any, any> | undefined;
        globalNodeOptions: IGlobalNodeOptions | undefined;
    });
    get typeInfo(): NodeTypeInfo;
    get key(): K | undefined;
    get sourceNodePath(): string;
    get matchingNodeOptions(): INodeSyncOptions<any, any, any> | undefined;
    get globalNodeOptions(): IGlobalNodeOptions | undefined;
    get wrappedRdoNode(): IRdoNodeWrapper<K, S, any> | undefined;
    setRdoNode(rdoNode: IRdoNodeWrapper<K, S, any>): void;
    abstract childElementCount(): number;
    abstract get value(): any;
}
