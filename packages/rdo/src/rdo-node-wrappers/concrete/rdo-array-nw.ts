import { RdoCollectionNWBase, RdoWrapperValidationUtils, NodeTypeUtils } from '..';
import { IGlobalNodeOptions, INodeSyncOptions, IRdoInternalNodeWrapper, isISourceCollectionNodeWrapper, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo, CollectionNodePatchOperation, IEqualityComparer } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { Logger } from '../../infrastructure/logger';
import { NodeChange } from '../../types/event-types';
import { CollectionUtils } from '../utils/collection.utils';
import _ from 'lodash';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';

const logger = Logger.make('RdoArrayNW');

export class RdoArrayNW<S, D> extends RdoCollectionNWBase<string, S, D> {
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
    key: string | undefined;
    mutableNodeCache: MutableNodeCache;
    wrappedParentRdoNode: IRdoInternalNodeWrapper<string, S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<string, S, D>;
    defaultEqualityComparer: IEqualityComparer;
    syncChildNode: ISyncChildNode;
    matchingNodeOptions: INodeSyncOptions<string, S, D> | undefined;
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
  public get leafNode() {
    return false;
  }

  public get value() {
    return this._value;
  }

  // public itemKeys() {
  //   if (this.childElementCount() === 0) return [];
  //   return CollectionUtils.Array.getCollectionKeys({ collection: this._value, makeCollectionKey: this.makeCollectionKey });
  // }

  // public getItem(key: string) {
  //   if (this.childElementCount() === 0) return undefined;
  //   const item = CollectionUtils.Array.getElement({ collection: this._value, makeCollectionKey: this.makeCollectionKey, key });
  //   return item;
  // }

  // public updateItem(key: string, value: D) {
  //   if (this.childElementCount() === 0) return false;
  //   return CollectionUtils.Array.updateElement({ collection: this._value, makeCollectionKey: this.makeCollectionKey, value });
  // }

  // public insertItem(key: string, value: D) {
  //   CollectionUtils.Array.insertElement({ collection: this._value, key, value });
  // }

  //------------------------------
  // IRdoInternalNodeWrapper
  //------------------------------
  // public smartSync(): boolean {
  //   if (this.wrappedSourceNode.childElementCount() === 0 && this.childElementCount() > 0) {
  //     return this.clearElements();
  //   } else {
  //     RdoWrapperValidationUtils.nonKeyedCollectionSizeCheck({ sourceNodePath: this.wrappedSourceNode.sourceNodePath, collectionSize: this.childElementCount(), collectionType: this.typeInfo.builtInType });

  //     if (!isISourceCollectionNodeWrapper(this.wrappedSourceNode)) throw new Error(`RDO collection nodes can only be synced with Source collection nodes (Path: '${this.wrappedSourceNode.sourceNodePath}'`);

  //     // Execute
  //     const changed = super.synchronizeCollection();

  //     return changed;
  //   }
  // }

  //------------------------------
  // IRdoCollectionNodeWrapper
  //------------------------------
  public elements(): Iterable<D> {
    return this._value;
  }

  public childElementCount(): number {
    return this._value.length;
  }

  // public deleteElement(key: string): D | undefined {
  //   return CollectionUtils.Array.deleteElement({ collection: this._value, makeCollectionKey: this.makeCollectionKey, key });
  // }

  // public clearElements(): boolean {
  //   return CollectionUtils.Array.clear({ collection: this._value });
  // }

  //------------------------------
  // RdoSyncableCollectionNW
  //------------------------------

  public executePatchOperations(patchOperations: CollectionNodePatchOperation<string, D>[]) {
    // Loop through and execute (note, the operations are in descending order by index

    for (const patchOp of patchOperations) {
      switch (patchOp.op) {
        case 'add':
          if (!patchOp.rdo) throw new Error('Rdo must not be null for patch-add operations');
          this.value.splice(patchOp.index, 0, patchOp.rdo);
        // now fall through to update, so the values sync to the new item
        case 'update':
          if (!patchOp.rdo) throw new Error('Rdo must not be null for patch-update operations');
          this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemValue: patchOp.rdo, rdoNodeItemKey: patchOp.key, sourceNodeItemKey: patchOp.key });
          break;
        case 'delete':
          this.value.splice(patchOp.index, 1);
          break;
        default:
          throw new Error(`Unknown operation: ${patchOp.op}`);
          break;
      }
    }
  }
}
