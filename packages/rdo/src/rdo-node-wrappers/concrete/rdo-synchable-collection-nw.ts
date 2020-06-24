import { RdoCollectionNWBase } from '..';
import {
  IGlobalNodeOptions,
  INodeSyncOptions,
  IRdoNodeWrapper,
  isISourceCollectionNodeWrapper,
  ISourceNodeWrapper,
  ISyncableRDOCollection,
  ISyncChildNode,
  NodeTypeInfo,
  IRdoInternalNodeWrapper,
  IEqualityComparer,
  CollectionNodePatchOperation,
} from '../..';
import { Logger } from '../../infrastructure/logger';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { NodeChange } from '../../types/event-types';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';

const logger = Logger.make('RdoSyncableCollectionNW');

export class RdoSyncableCollectionNW<K extends string | number, S, D> extends RdoCollectionNWBase<K, S, D> {
  private _value: ISyncableRDOCollection<K, S, D>;

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
    value: ISyncableRDOCollection<K, S, D>;
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
    super({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, defaultEqualityComparer, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
    this._value = value;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get leafNode() {
    return false;
  }

  public get value() {
    return this._value;
  }

  public itemKeys() {
    return this._value.getCollectionKeys();
  }

  public getItem(key: K) {
    return this._value.getElement(key);
  }

  public updateItem(key: K, value: D) {
    return this._value.updateElement(key, value);
  }

  //------------------------------
  // IRdoInternalNodeWrapper
  //------------------------------

  public smartSync(): boolean {
    if (this.wrappedSourceNode.childElementCount() === 0 && this.childElementCount() > 0) {
      return this.clearElements();
    } else {
      if (!isISourceCollectionNodeWrapper(this.wrappedSourceNode)) throw new Error(`RDO collection nodes can only be synced with Source collection nodes (Path: '${this.wrappedSourceNode.sourceNodePath}'`);
      return super.synchronizeCollection();
    }
  }

  //------------------------------
  // IRdoCollectionNodeWrapper
  //------------------------------
  public elements(): Iterable<D> {
    return this._value.elements();
  }

  public childElementCount(): number {
    return this._value.size;
  }

  public insertItem(key: K, value: D) {
    this._value.insertElement(key, value);
  }

  public deleteElement(key: K): D | undefined {
    return this._value.deleteElement(key);
  }

  public clearElements(): boolean {
    return this._value.clearElements();
  }

  //------------------------------
  // RdoSyncableCollectionNW
  //------------------------------
  public executePatchOperations(patchOperations: CollectionNodePatchOperation<K, D>[]) {
    // Should already be in reverse index order. Loop through and execute

    for (const patchOp of patchOperations) {
      switch (patchOp.op) {
        case 'add':
          if (!patchOp.rdo) throw new Error('Rdo must not be null for patch-add operations');
          this.value.insertElement(patchOp.key, patchOp.rdo);
        // now fall through to update, so the values sync to the new item
        case 'update':
          if (!patchOp.rdo) throw new Error('Rdo must not be null for patch-update operations');
          this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemValue: patchOp.rdo, rdoNodeItemKey: patchOp.key, sourceNodeItemKey: patchOp.key });
          break;
        case 'remove':
          this.value.deleteElement(patchOp.key);
          break;
        default:
          throw new Error(`Unknown operation: ${patchOp.op}`);
          break;
      }
    }
  }
}
