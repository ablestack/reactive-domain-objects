import { RdoCollectionNWBase } from '..';
import { IGlobalNodeOptions, INodeSyncOptions, IRdoNodeWrapper, isISourceCollectionNodeWrapper, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo, IRdoInternalNodeWrapper, IEqualityComparer, CollectionNodePatchOperation } from '../..';
import { Logger } from '../../infrastructure/logger';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { NodeChange } from '../../types/event-types';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';

const logger = Logger.make('RdoMapNW');

export class RdoMapNW<K extends string | number, S, D> extends RdoCollectionNWBase<K, S, D> {
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
  public get leafNode() {
    return false;
  }

  public get value() {
    return this._value;
  }

  // public itemKeys() {
  //   return this._value.keys();
  // }

  // public getItem(key: K) {
  //   return this._value.get(key);
  // }

  // public updateItem(key: K, value: D) {
  //   if (this._value.has(key)) {
  //     this._value.set(key, value);
  //     return true;
  //   } else return false;
  // }

  // public insertItem(key: K, value: D) {
  //   this._value.set(key, value);
  // }

  //------------------------------
  // IRdoInternalNodeWrapper
  //------------------------------

  // public smartSync(): boolean {
  //   if (this.wrappedSourceNode.childElementCount() === 0 && this.childElementCount() > 0) {
  //     return this.clearElements();
  //   } else {
  //     // Validate
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

  // public deleteElement(key: K): D | undefined {
  //   const item = this._value.get(key);
  //   this._value.delete(key);
  //   return item;
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

    // EXECUTE
    for (const patchOp of patchOperations) {
      switch (patchOp.op) {
        case 'add':
          if (!patchOp.rdo) throw new Error('Rdo must not be null for patch-add operations');
          this.value.set(patchOp.key, patchOp.rdo);
        // now fall through to update, so the values sync to the new item
        case 'update':
          if (!patchOp.rdo) throw new Error('Rdo must not be null for patch-update operations');
          this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemValue: patchOp.rdo, rdoNodeItemKey: patchOp.key, sourceNodeItemKey: patchOp.key });
          break;
        case 'delete':
          this.value.delete(patchOp.key);
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
