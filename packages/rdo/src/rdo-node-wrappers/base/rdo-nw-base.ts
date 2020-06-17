import { Logger } from '../../infrastructure/logger';
import { IRdoNodeWrapper, RdoNodeTypeInfo, ISourceNodeWrapper, IGlobalNodeOptions, INodeSyncOptions } from '../..';

const logger = Logger.make('RdoMapNW');

export abstract class RdoNWBase<S, D> implements IRdoNodeWrapper<S, D> {
  private _typeInfo: RdoNodeTypeInfo;
  private _key: string | undefined;
  private _parent: IRdoNodeWrapper<S, D> | undefined;
  private _wrappedSourceNode: ISourceNodeWrapper<S>;
  private _matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
  private _globalNodeOptions: IGlobalNodeOptions | undefined;
  private _targetedOptionMatchersArray: Array<INodeSyncOptions<any, any>>;

  constructor({
    typeInfo,
    key,
    wrappedParentRdoNode,
    wrappedSourceNode,
    matchingNodeOptions,
    globalNodeOptions,
    targetedOptionMatchersArray,
  }: {
    typeInfo: RdoNodeTypeInfo;
    key: string | undefined;
    wrappedParentRdoNode: IRdoNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S>;
    matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
    globalNodeOptions: IGlobalNodeOptions | undefined;
    targetedOptionMatchersArray: Array<INodeSyncOptions<any, any>>;
  }) {
    this._typeInfo = typeInfo;
    this._key = key;
    this._parent = wrappedParentRdoNode;
    this._wrappedSourceNode = wrappedSourceNode;
    this._matchingNodeOptions = matchingNodeOptions;
    this._globalNodeOptions = globalNodeOptions;
    this._targetedOptionMatchersArray = targetedOptionMatchersArray;

    // link Rdo node to source node
    wrappedSourceNode.setRdoNode(this);
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get ignore(): boolean {
    return this.getNodeOptions()?.ignore || false;
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

  public get globalNodeOptions(): IGlobalNodeOptions | undefined {
    return this._globalNodeOptions;
  }

  private _nodeOptions: INodeSyncOptions<any, any> | undefined | null;
  public getNodeOptions(): INodeSyncOptions<any, any> | null {
    if (this._nodeOptions === undefined) {
      if (this._matchingNodeOptions) {
        this._nodeOptions = this._matchingNodeOptions;
      } else if (this._targetedOptionMatchersArray) {
        this._nodeOptions = this._targetedOptionMatchersArray.find((targetOptionMatcher) => targetOptionMatcher.sourceNodeMatcher.nodeContent && targetOptionMatcher.sourceNodeMatcher.nodeContent(this.value)) || null;
      } else this._nodeOptions = null;
    }
    return this._nodeOptions;
  }

  public abstract get value();
  public abstract smartSync();
  public abstract childElementCount();
}
