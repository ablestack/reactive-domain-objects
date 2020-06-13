import { ISourceNodeWrapper, SourceNodeTypeInfo, INodeSyncOptions, IGlobalNameOptions } from '../..';

export abstract class SourceBaseNW<S> implements ISourceNodeWrapper<S> {
  private _key: string | undefined;
  private _typeInfo: SourceNodeTypeInfo;
  private _sourceNodePath: string;
  private _lastSourceNode: S | undefined;
  private _matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
  private _globalNodeOptions: IGlobalNameOptions | undefined;

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
    typeInfo: SourceNodeTypeInfo;
    lastSourceNode: any;
    matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
    globalNodeOptions: IGlobalNameOptions | undefined;
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

  public get typeInfo(): SourceNodeTypeInfo {
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

  public get globalNodeOptions(): IGlobalNameOptions | undefined {
    return this._globalNodeOptions;
  }

  public abstract childElementCount(): number;
  public abstract get value();
}
