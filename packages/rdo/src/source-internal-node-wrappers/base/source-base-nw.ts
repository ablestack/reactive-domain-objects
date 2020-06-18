import { ISourceNodeWrapper, NodeTypeInfo, INodeSyncOptions, IGlobalNodeOptions, IRdoNodeWrapper } from '../..';

export abstract class SourceBaseNW<S> implements ISourceNodeWrapper<S> {
  private _key: string | undefined;
  private _typeInfo: NodeTypeInfo;
  private _sourceNodePath: string;
  private _lastSourceNode: S | undefined;
  private _matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
  private _globalNodeOptions: IGlobalNodeOptions | undefined;
  private _wrappedRdoNode: IRdoNodeWrapper<S, any> | undefined;

  constructor({
    sourceNodePath,
    key,
    typeInfo,
    lastSourceNode,
    matchingNodeOptions,
    globalNodeOptions,
  }: {
    sourceNodePath: string;
    key: string | undefined;
    typeInfo: NodeTypeInfo;
    lastSourceNode: any;
    matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
    globalNodeOptions: IGlobalNodeOptions | undefined;
  }) {
    this._typeInfo = typeInfo;
    this._key = key;
    this._sourceNodePath = sourceNodePath;
    this._lastSourceNode = lastSourceNode;
    this._matchingNodeOptions = matchingNodeOptions;
    this._globalNodeOptions = globalNodeOptions;
  }

  //------------------------------
  // ISourceNodeWrapper
  //------------------------------

  public get typeInfo(): NodeTypeInfo {
    return this._typeInfo;
  }

  public get key() {
    return this._key;
  }

  public get sourceNodePath(): string {
    return this._sourceNodePath;
  }

  public get lastSourceNode() {
    return this._lastSourceNode;
  }

  public get matchingNodeOptions(): INodeSyncOptions<any, any> | undefined {
    return this._matchingNodeOptions;
  }

  public get globalNodeOptions(): IGlobalNodeOptions | undefined {
    return this._globalNodeOptions;
  }

  public get wrappedRdoNode() {
    return this._wrappedRdoNode;
  }

  public setRdoNode(rdoNode: IRdoNodeWrapper<S, any>) {
    this._wrappedRdoNode = rdoNode;
  }

  public abstract childElementCount(): number;
  public abstract get value();
}
