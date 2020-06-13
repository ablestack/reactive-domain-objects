import { Logger } from '../../infrastructure/logger';
import { IRdoNodeWrapper, RdoNodeTypeInfo, ISourceNodeWrapper, IGlobalNameOptions, INodeSyncOptions } from '../..';

const logger = Logger.make('RdoMapNW');

export abstract class RdoNWBase<S, D> implements IRdoNodeWrapper<S, D> {
  private _typeInfo: RdoNodeTypeInfo;
  private _key: string | undefined;
  private _parent: IRdoNodeWrapper<S, D> | undefined;
  private _wrappedSourceNode: ISourceNodeWrapper<S>;
  private _matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
  private _globalNodeOptions: IGlobalNameOptions | undefined;

  constructor({
    typeInfo,
    key,
    wrappedParentRdoNode,
    wrappedSourceNode,
    matchingNodeOptions,
    globalNodeOptions,
  }: {
    typeInfo: RdoNodeTypeInfo;
    key: string | undefined;
    wrappedParentRdoNode: IRdoNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S>;
    matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
    globalNodeOptions: IGlobalNameOptions | undefined;
  }) {
    this._typeInfo = typeInfo;
    this._key = key;
    this._parent = wrappedParentRdoNode;
    this._wrappedSourceNode = wrappedSourceNode;
    this._matchingNodeOptions = matchingNodeOptions;
    this._globalNodeOptions = globalNodeOptions;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get ignore(): boolean {
    return (this._matchingNodeOptions && this.matchingNodeOptions?.ignore) || false;
  }

  public get key() {
    return this._key;
  }

  public get wrappedParentRdoNode() {
    return this._parent;
  }

  public get typeInfo(): RdoNodeTypeInfo {
    return this._typeInfo;
  }

  public get wrappedSourceNode(): ISourceNodeWrapper<S> {
    return this._wrappedSourceNode;
  }

  public get matchingNodeOptions(): INodeSyncOptions<any, any> | undefined {
    return this._matchingNodeOptions;
  }

  public get globalNodeOptions(): IGlobalNameOptions | undefined {
    return this._globalNodeOptions;
  }

  public abstract get value();
  public abstract smartSync();
  public abstract childElementCount();
}
