import { RdoCollectionNWBase, RdoWrapperValidationUtils } from '..';
import { IGlobalNodeOptions, INodeSyncOptions, IRdoNodeWrapper, isISourceCollectionNodeWrapper, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo, IRdoInternalNodeWrapper, IEqualityComparer, CollectionNodePatchOperation } from '../..';
import { Logger } from '../../infrastructure/logger';
import { CollectionUtils } from '../utils/collection.utils';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { NodeChange } from '../../types/event-types';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';

const logger = Logger.make('RdoSetNW');

export class RdoSetNW<K extends string | number, S, D> extends RdoCollectionNWBase<K, S, D> {
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
  public get leafNode() {
    return false;
  }

  public get value() {
    return this._value;
  }

  // public itemKeys() {
  //   if (this.childElementCount() === 0) return [];
  //   return CollectionUtils.Set.getCollectionKeys({ collection: this._value, makeCollectionKey: this.makeCollectionKey });
  // }

  // public getItem(key: K) {
  //   if (this.childElementCount() === 0) return undefined;
  //   return CollectionUtils.Set.getElement({ collection: this._value, makeCollectionKey: this.makeCollectionKey!, key });
  // }

  // public updateItem(key: K, value: D) {
  //   if (this.childElementCount() === 0) return false;
  //   return CollectionUtils.Set.updateElement<K, D>({ collection: this._value, makeCollectionKey: this.makeCollectionKey, value });
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
  //     return super.synchronizeCollection();
  //   }
  // }

  //------------------------------
  // IRdoCollectionNodeWrapper
  //------------------------------
  public elements(): Iterable<D> {
    return this._value.values();
  }

  public childElementCount(): number {
    return this._value.size;
  }

  // public insertItem(key: K, value: D) {
  //   CollectionUtils.Set.insertElement({ collection: this._value, key, value });
  // }

  // public deleteElement(key: K): D | undefined {
  //   return CollectionUtils.Set.deleteElement({ collection: this._value, makeCollectionKey: this.makeCollectionKey, key });
  // }

  // public clearElements(): boolean {
  //   if (this.childElementCount() === 0) return false;
  //   this._value.clear();
  //   return true;
  // }

  //------------------------------
  // RdoSyncableCollectionNW
  //------------------------------
  public executePatchOperations(patchOperations: CollectionNodePatchOperation<K, D>[]) {
    // Loop through and execute (note, the operations are in descending order by index

    for (const patchOp of patchOperations) {
      // EXECUTE
      switch (patchOp.op) {
        case 'add':
          if (!patchOp.rdo) throw new Error('Rdo must not be null for patch-add operations');
          this.value.add(patchOp.rdo);
        // now fall through to update, so the values sync to the new item
        case 'update':
          if (!patchOp.rdo) throw new Error('Rdo must not be null for patch-update operations');
          this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemValue: patchOp.rdo, rdoNodeItemKey: patchOp.key, sourceNodeItemKey: patchOp.key });
          break;
        case 'delete':
          if (!patchOp.rdo) throw new Error('Rdo must not be null for Set patch-delete operations');
          this.value.delete(patchOp.rdo);
          break;
        default:
          throw new Error(`Unknown operation: ${patchOp.op}`);
          break;
      }

      // PUBLISH
      this.eventEmitter.publish('nodeChange', {
        changeType: patchOp.op,
        sourceNodePath: this.wrappedSourceNode.sourceNodePath,
        sourceKey: patchOp.key,
        rdoKey: patchOp.key,
        previousSourceValue: patchOp.previousSourceValue,
        newSourceValue: patchOp.newSourceValue,
      });
    }
  }
}
