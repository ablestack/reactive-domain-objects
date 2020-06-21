import { Logger } from '../../infrastructure/logger';
import { IRdoNodeWrapper, NodeTypeInfo, ISourceNodeWrapper, IGlobalNodeOptions, INodeSyncOptions } from '../..';
import { isISourceCollectionNodeWrapper, isIRdoCollectionNodeWrapper, IRdoInternalNodeWrapper } from '../../types';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { NodeChange } from '../../types/event-types';

const logger = Logger.make('RdoMapNW');

export abstract class RdoNWBase<K extends string | number | symbol, S, D> implements IRdoNodeWrapper<K, S, D> {
  private _typeInfo: NodeTypeInfo;
  private _key: K | undefined;
  private _parent: IRdoInternalNodeWrapper<any, S, D> | undefined;
  private _wrappedSourceNode: ISourceNodeWrapper<K, S, D>;
  private _matchingNodeOptions: INodeSyncOptions<K, S, D> | undefined;
  private _globalNodeOptions: IGlobalNodeOptions | undefined;
  private _targetedOptionMatchersArray: Array<INodeSyncOptions<K, S, D>>;
  private _eventEmitter: EventEmitter<NodeChange>;

  constructor({
    typeInfo,
    key,
    wrappedParentRdoNode,
    wrappedSourceNode,
    matchingNodeOptions,
    globalNodeOptions,
    targetedOptionMatchersArray,
    eventEmitter,
  }: {
    typeInfo: NodeTypeInfo;
    key: K | undefined;
    wrappedParentRdoNode: IRdoInternalNodeWrapper<any, S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<K, S, D>;
    matchingNodeOptions: INodeSyncOptions<K, S, D> | undefined;
    globalNodeOptions: IGlobalNodeOptions | undefined;
    targetedOptionMatchersArray: Array<INodeSyncOptions<K, S, D>>;
    eventEmitter: EventEmitter<NodeChange>;
  }) {
    this._typeInfo = typeInfo;
    this._key = key;
    this._parent = wrappedParentRdoNode;
    this._wrappedSourceNode = wrappedSourceNode;
    this._matchingNodeOptions = matchingNodeOptions;
    this._globalNodeOptions = globalNodeOptions;
    this._targetedOptionMatchersArray = targetedOptionMatchersArray;
    this._eventEmitter = eventEmitter;

    // link Rdo node to source node
    wrappedSourceNode.setRdoNode(this);
  }

  //------------------------------
  // Protected
  //------------------------------
  protected get eventEmitter(): EventEmitter<NodeChange> {
    return this._eventEmitter;
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

  public get typeInfo(): NodeTypeInfo {
    return this._typeInfo;
  }

  public get wrappedSourceNode(): ISourceNodeWrapper<K, S, D> {
    return this._wrappedSourceNode;
  }

  public get globalNodeOptions(): IGlobalNodeOptions | undefined {
    return this._globalNodeOptions;
  }

  private _nodeOptions: INodeSyncOptions<K, S, D> | undefined | null;
  public getNodeOptions(): INodeSyncOptions<K, S, D> | null {
    if (this._nodeOptions === undefined) {
      // Look for node options from path match
      if (this._matchingNodeOptions) {
        this._nodeOptions = this._matchingNodeOptions;

        // Look for node options from targetOptionMatchers
      } else if (this._targetedOptionMatchersArray) {
        let firstElement;

        // Try to get first element from either collection for matching
        if (this.wrappedSourceNode.childElementCount() > 0 && isISourceCollectionNodeWrapper(this.wrappedSourceNode)) {
          firstElement = this.wrappedSourceNode.elements()[Symbol.iterator]().next().value;
        } else if (this.childElementCount() > 0 && isIRdoCollectionNodeWrapper(this)) {
          firstElement = this.elements()[Symbol.iterator]().next().value;
        }
        // If element found, use to test against matchers
        if (firstElement) {
          this._nodeOptions = this._targetedOptionMatchersArray.find((targetOptionMatcher) => targetOptionMatcher.sourceNodeMatcher.nodeContent && targetOptionMatcher.sourceNodeMatcher.nodeContent(firstElement)) || null;
        } else {
          this._nodeOptions = null;
        }

        // No matching node options. Set to null
      } else {
        this._nodeOptions = null;
      }
    }

    return this._nodeOptions;
  }

  public abstract get value();
  public abstract smartSync();
  public abstract childElementCount();
}
