import { IEqualityComparer, IGlobalNodeOptions, INodeSyncOptions, IRdoInternalNodeWrapper, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { Logger } from '../../infrastructure/logger';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { NodeChange } from '../../types/event-types';
import { RdoKeyCollectionNWBase } from '../base/rdo-key-based-collection-nw-base';

const logger = Logger.make('RdoMapNW');

export class RdoMapNW<S, D> extends RdoKeyCollectionNWBase<S, D> {
  private _value: Map<string | number, D>;

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
    value: Map<string | number, D>;
    typeInfo: NodeTypeInfo;
    key: string | number | undefined;
    mutableNodeCache: MutableNodeCache;
    wrappedParentRdoNode: IRdoInternalNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S, D>;
    defaultEqualityComparer: IEqualityComparer;
    syncChildNode: ISyncChildNode;
    matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
    globalNodeOptions: IGlobalNodeOptions | undefined;
    targetedOptionMatchersArray: Array<INodeSyncOptions<any, any>>;
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
  protected onAdd = ({ key, newItem }: { key: string | number; newItem: any }) => {
    this.value.set(key, newItem);
    return true;
  };

  protected onReplace = ({ key, origItem, newItem }: { key: string | number; origItem: any; newItem: any }) => {
    this.value.set(key, newItem);
    return true;
  };

  protected onDelete = ({ key, origItem }: { key: string | number; origItem: any }) => {
    this.value.delete(key);
    return true;
  };
}
