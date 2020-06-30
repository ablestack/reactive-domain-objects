import { IEqualityComparer, IGlobalNodeOptions, INodeSyncOptions, IRdoInternalNodeWrapper, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { Logger } from '../../infrastructure/logger';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { NodeChange } from '../../types/event-types';
import { RdoKeyCollectionNWBase } from '../base/rdo-key-based-collection-nw-base';

const logger = Logger.make('RdoMapNW');

export class RdoMapNW<K extends string | number, S, D> extends RdoKeyCollectionNWBase<K, S, D> {
  private _value: Map<K, D>;

  constructor({
    value,
    typeInfo,
    key,
    mutableNodeCache,
    wrappedParentRdoNode,
    wrappedSourceNode,
    syncChildNode,
    defaultEqualityComparer,
    matchingNodeOptions,
    globalNodeOptions,
    targetedOptionMatchersArray,
    eventEmitter,
  }: {
    value: Map<K, D>;
    typeInfo: NodeTypeInfo;
    key: K | undefined;
    mutableNodeCache: MutableNodeCache;
    wrappedParentRdoNode: IRdoInternalNodeWrapper<K, S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<K, S, D>;
    defaultEqualityComparer: IEqualityComparer;
    syncChildNode: ISyncChildNode;
    matchingNodeOptions: INodeSyncOptions<any, any, any> | undefined;
    globalNodeOptions: IGlobalNodeOptions | undefined;
    targetedOptionMatchersArray: Array<INodeSyncOptions<any, any, any>>;
    eventEmitter: EventEmitter<NodeChange>;
  }) {
    super({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
    this._value = value;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get isLeafNode() {
    return false;
  }

  public get value() {
    return this._value;
  }

  //------------------------------
  // IRdoInternalNodeWrapper
  //------------------------------
  public getItem(key: K) {
    return this._value.get(key);
  }

  //------------------------------
  // IRdoCollectionNodeWrapper
  //------------------------------
  public elements(): Iterable<D> {
    return this._value.values();
  }

  public childElementCount(): number {
    return this._value.size;
  }

  //------------------------------
  // RdoIndexCollectionNWBase
  //------------------------------
  protected onNewKey = ({ index, key, nextRdo }: { index?: number; key: K; nextRdo: any }) => {
    this.value.set(key, nextRdo);
    return true;
  };

  protected onReplaceKey = ({ index, key, lastRdo, nextRdo }: { index?: number; key: K; lastRdo: any; nextRdo: any }) => {
    this.value.set(key, nextRdo);
    return true;
  };

  protected onDeleteKey = ({ index, key, lastRdo }: { index?: number; key: K; lastRdo: any }) => {
    this.value.delete(key);
    return true;
  };
}
