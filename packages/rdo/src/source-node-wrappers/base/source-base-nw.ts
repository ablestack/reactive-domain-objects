import { ISourceNodeWrapper, NodeTypeInfo, INodeSyncOptions, IGlobalNodeOptions, IRdoNodeWrapper } from '../..';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';

export abstract class SourceBaseNW<S, D> implements ISourceNodeWrapper<S, D> {
  private _key: string | number | undefined;
  private _typeInfo: NodeTypeInfo;
  private _sourceNodeTypePath: string;
  private _sourceNodeInstancePath: string;
  private _matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
  private _globalNodeOptions: IGlobalNodeOptions | undefined;
  private _wrappedRdoNode: IRdoNodeWrapper<S, any> | undefined;

  constructor({
    sourceNodeTypePath,
    sourceNodeInstancePath,
    key,
    typeInfo,
    matchingNodeOptions,
    globalNodeOptions,
  }: {
    sourceNodeTypePath: string;
    sourceNodeInstancePath: string;
    key: string | number | undefined;
    typeInfo: NodeTypeInfo;
    matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
    globalNodeOptions: IGlobalNodeOptions | undefined;
  }) {
    this._typeInfo = typeInfo;
    this._key = key;
    this._sourceNodeTypePath = sourceNodeTypePath;
    this._sourceNodeInstancePath = sourceNodeInstancePath;
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

  public get sourceNodeTypePath(): string {
    return this._sourceNodeTypePath;
  }

  public get sourceNodeInstancePath(): string {
    return this._sourceNodeInstancePath;
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
