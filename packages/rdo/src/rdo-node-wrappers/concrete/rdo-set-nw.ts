import { IEqualityComparer, IGlobalNodeOptions, INodeSyncOptions, IRdoInternalNodeWrapper, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { Logger } from '../../infrastructure/logger';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { NodeChange } from '../../types/event-types';
import { RdoKeyCollectionNWBase } from '../base/rdo-key-based-collection-nw-base';

const logger = Logger.make('RdoSetNW');

export class RdoSetNW<K extends string | number, S, D> extends RdoKeyCollectionNWBase<K, S, D> {
  private _value: Set<D>;

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
    value: Set<D>;
    typeInfo: NodeTypeInfo;
    key: K | undefined;
    mutableNodeCache: MutableNodeCache;
    wrappedParentRdoNode: IRdoInternalNodeWrapper<K, S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<K, S, D>;
    syncChildNode: ISyncChildNode;
    defaultEqualityComparer: IEqualityComparer;
    matchingNodeOptions: INodeSyncOptions<K, S, D> | undefined;
    globalNodeOptions: IGlobalNodeOptions | undefined;
    targetedOptionMatchersArray: Array<INodeSyncOptions<any, any, any>>;
    eventEmitter: EventEmitter<NodeChange>;
  }) {
    super({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, defaultEqualityComparer, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
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

  public getItem(key: K) {
    return this.last.rdoByKeyMap.get(key);
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
  // RdoSyncableCollectionNW
  //------------------------------

  protected onNewKey = ({ index, key, nextRdo }: { index?: number; key: K; nextRdo: any }) => {
    this.value.add(nextRdo);
    return true;
  };

  protected onReplaceKey = ({ index, key, lastRdo, nextRdo }: { index?: number; key: K; lastRdo: any; nextRdo: any }) => {
    this.value.delete(lastRdo);
    this.value.add(nextRdo);
    return true;
  };

  protected onDeleteKey = ({ index, key, lastRdo }: { index?: number; key: K; lastRdo: any }) => {
    this.value.delete(lastRdo);
    return true;
  };
}
