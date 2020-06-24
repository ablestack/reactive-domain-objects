import { ISourceNodeWrapper, NodeTypeInfo, INodeSyncOptions, IGlobalNodeOptions, IRdoNodeWrapper } from '../..';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';

export abstract class SourceBaseNW<K extends string | number, S, D> implements ISourceNodeWrapper<K, S, D> {
  private _key: K | undefined;
  private _typeInfo: NodeTypeInfo;
  private _sourceNodePath: string;
  private _matchingNodeOptions: INodeSyncOptions<any, any, any> | undefined;
  private _globalNodeOptions: IGlobalNodeOptions | undefined;
  private _wrappedRdoNode: IRdoNodeWrapper<K, S, any> | undefined;

  constructor({
    sourceNodePath,
    key,
    typeInfo,
    matchingNodeOptions,
    globalNodeOptions,
  }: {
    sourceNodePath: string;
    key: K | undefined;
    typeInfo: NodeTypeInfo;
    matchingNodeOptions: INodeSyncOptions<any, any, any> | undefined;
    globalNodeOptions: IGlobalNodeOptions | undefined;
  }) {
    this._typeInfo = typeInfo;
    this._key = key;
    this._sourceNodePath = sourceNodePath;
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

  public get matchingNodeOptions(): INodeSyncOptions<any, any, any> | undefined {
    return this._matchingNodeOptions;
  }

  public get globalNodeOptions(): IGlobalNodeOptions | undefined {
    return this._globalNodeOptions;
  }

  public get wrappedRdoNode() {
    return this._wrappedRdoNode;
  }

  public setRdoNode(rdoNode: IRdoNodeWrapper<K, S, any>) {
    this._wrappedRdoNode = rdoNode;
  }

  public abstract childElementCount(): number;
  public abstract get value();
}
