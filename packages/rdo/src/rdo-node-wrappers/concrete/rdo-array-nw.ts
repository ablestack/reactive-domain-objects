import { IEqualityComparer, IGlobalNodeOptions, INodeSyncOptions, IRdoInternalNodeWrapper, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { Logger } from '../../infrastructure/logger';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { NodeChange } from '../../types/event-types';
import { RdoIndexCollectionNWBase } from '../base/rdo-index-collection-nw-base';

const logger = Logger.make('RdoArrayNW');

export class RdoArrayNW<S, D> extends RdoIndexCollectionNWBase<S, D> {
  private _value: Array<D>;

  constructor({
    value,
    typeInfo,
    key,
    mutableNodeCache,
    wrappedParentRdoNode,
    wrappedSourceNode,
    defaultEqualityComparer,
    syncChildNode,
    matchingNodeOptions,
    globalNodeOptions,
    targetedOptionMatchersArray,
    eventEmitter,
  }: {
    value: Array<D>;
    typeInfo: NodeTypeInfo;
    key: number | undefined;
    mutableNodeCache: MutableNodeCache;
    wrappedParentRdoNode: IRdoInternalNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S, D>;
    defaultEqualityComparer: IEqualityComparer;
    syncChildNode: ISyncChildNode;
    matchingNodeOptions: INodeSyncOptions<S, D> | undefined;
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
    return this._value;
  }

  public childElementCount(): number {
    return this._value.length;
  }

  //------------------------------
  // RdoIndexCollectionNWBase
  //------------------------------
  protected onAdd = ({ index, key, newItem }: { index?: number; key: number | string; newItem: any }) => {
    if (index === null || index === undefined) throw new Error('Index can not be null or undefined for index based collection operations');
    this.value.splice(index, 0, newItem);
    return true;
  };

  protected onReplace = ({ index, key, origItem, newItem }: { index?: number; key: number | string; origItem: any; newItem: any }) => {
    if (index === null || index === undefined) throw new Error('Index can not be null or undefined for index based collection operations');
    this.value.splice(index, 1, newItem);
    return true;
  };

  protected onDelete = ({ index, key, origItem }: { index?: number; key: number | string; origItem: any }) => {
    if (index === null || index === undefined) throw new Error('Index can not be null or undefined for index based collection operations');
    this.value.splice(index, 1);
    return true;
  };
}
