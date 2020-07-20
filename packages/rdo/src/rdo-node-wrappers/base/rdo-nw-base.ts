import { Logger } from '../../infrastructure/logger';
import { IRdoNodeWrapper, NodeTypeInfo, ISourceNodeWrapper, IGlobalNodeOptions, INodeSyncOptions } from '../..';
import { isISourceCollectionNodeWrapper, isIRdoCollectionNodeWrapper, IRdoInternalNodeWrapper } from '../../types';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { NodeChange } from '../../types/event-types';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';

const logger = Logger.make('RdoMapNW');

export abstract class RdoNWBase<S, D> implements IRdoNodeWrapper<S, D> {
  private _typeInfo: NodeTypeInfo;
  private _key: string | number | undefined;
  private _mutableNodeCache: MutableNodeCache;
  private _parent: IRdoInternalNodeWrapper<S, D> | undefined;
  private _wrappedSourceNode: ISourceNodeWrapper<S, D>;
  private _matchingNodeOptions: INodeSyncOptions<S, D> | undefined;
  private _globalNodeOptions: IGlobalNodeOptions | undefined;
  private _targetedOptionMatchersArray: Array<INodeSyncOptions<S, D>>;
  private _eventEmitter: EventEmitter<NodeChange>;

  constructor({
    typeInfo,
    key,
    mutableNodeCache,
    wrappedParentRdoNode,
    wrappedSourceNode,
    matchingNodeOptions,
    globalNodeOptions,
    targetedOptionMatchersArray,
    eventEmitter,
  }: {
    typeInfo: NodeTypeInfo;
    key: string | number | undefined;
    mutableNodeCache: MutableNodeCache;
    wrappedParentRdoNode: IRdoInternalNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S, D>;
    matchingNodeOptions: INodeSyncOptions<S, D> | undefined;
    globalNodeOptions: IGlobalNodeOptions | undefined;
    targetedOptionMatchersArray: Array<INodeSyncOptions<S, D>>;
    eventEmitter: EventEmitter<NodeChange>;
  }) {
    this._typeInfo = typeInfo;
    this._key = key;
    this._mutableNodeCache = mutableNodeCache;
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

  protected get mutableNodeCache(): MutableNodeCache {
    return this._mutableNodeCache;
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

  public get wrappedSourceNode(): ISourceNodeWrapper<S, D> {
    return this._wrappedSourceNode;
  }

  public get globalNodeOptions(): IGlobalNodeOptions | undefined {
    return this._globalNodeOptions;
  }

  private _nodeOptions: INodeSyncOptions<S, D> | undefined | null;
  public getNodeOptions(): INodeSyncOptions<S, D> | null {
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

  public abstract get isLeafNode();
  public abstract get value();
  public abstract smartSync();
  public abstract childElementCount();
  public abstract getSourceNodeKeys();
  public abstract getSourceNodeItem(key: string | number);
}
