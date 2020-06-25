import { RdoCollectionNWBase, RdoWrapperValidationUtils, NodeTypeUtils } from '..';
import {
  IGlobalNodeOptions,
  INodeSyncOptions,
  IRdoNodeWrapper,
  isISourceCollectionNodeWrapper,
  ISourceNodeWrapper,
  ISyncChildNode,
  NodeTypeInfo,
  IRdoInternalNodeWrapper,
  IEqualityComparer,
  CollectionNodePatchOperation,
  ISourceCollectionNodeWrapper,
  NodePatchOperationType,
} from '../..';
import { Logger } from '../../infrastructure/logger';
import { CollectionUtils } from '../utils/collection.utils';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { NodeChange } from '../../types/event-types';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { isNullOrUndefined } from '../utils/global.utils';

const logger = Logger.make('RdoSetNW');
type MutableCachedNodeItemType<K, S, D> = { sourceData: Array<S>; rdoMap: Map<K, D> };

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
  // Private
  //------------------------------
  protected getNodeInstanceCache(): MutableCachedNodeItemType<K, S, D> {
    let mutableNodeCacheItem = this.mutableNodeCache.get<MutableCachedNodeItemType<K, S, D>>({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath });
    if (!mutableNodeCacheItem) {
      mutableNodeCacheItem = { sourceData: new Array<S>(), rdoMap: new Map<K, D>() };
      this.mutableNodeCache.set({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath, data: mutableNodeCacheItem });
    }
    return mutableNodeCacheItem;
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
  //     RdoWrapperValidationUtils.nonKeyedCollectionSizeCheck({ sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath, collectionSize: this.childElementCount(), collectionType: this.typeInfo.stringifiedType });

  //     if (!isISourceCollectionNodeWrapper(this.wrappedSourceNode)) throw new Error(`RDO collection nodes can only be synced with Source collection nodes (Path: '${this.wrappedSourceNode.sourceNodeTypePath}'`);

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
  protected sync(): boolean {
    //
    // Setup
    let changed = false;
    const mutableNodeCacheItem = this.getNodeInstanceCache();
    const origSourceArray = mutableNodeCacheItem.sourceData;
    const wrappedSourceNode = this.wrappedSourceNode as ISourceCollectionNodeWrapper<string, S, D>;
    const rdoMap = mutableNodeCacheItem.rdoMap;
    const newSourceArray = this.wrappedSourceNode.value as Array<S>;
    const count = Math.max(origSourceArray.length, newSourceArray.length);
    let offset = 0; // use offset to adjust index based on additions and removals

    //
    // Loop
    for (let i = 0; i < count; i++) {
      const previousSourceElement = origSourceArray[i];
      const newSourceElement = newSourceArray[i];
      const index = i + offset;

      if (isNullOrUndefined(previousSourceElement) && !isNullOrUndefined(newSourceElement)) {
        // ---------------------------
        // New Key - ADD
        // ---------------------------
        const newElementKey = wrappedSourceNode.makeCollectionKey(newSourceElement);
        const newRdo = this.makeRdoElement(newSourceElement);

        // Add operation
        this.value.splice(index, 0, newRdo);
        changed = true;
        offset++;

        // If not primitive, sync so child nodes are hydrated
        if (NodeTypeUtils.isPrimitive(newRdo)) this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemValue: newRdo, rdoNodeItemKey: newElementKey, sourceNodeItemKey: newElementKey });

        // Publish
        this.eventEmitter.publish('nodeChange', {
          changeType: 'add',
          sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath,
          index,
          sourceKey: newElementKey,
          rdoKey: newElementKey,
          previousSourceValue: undefined,
          newSourceValue: newSourceElement,
        });

        // Update Rdo Map
        rdoMap.set(newElementKey, newRdo);
      } else if (!isNullOrUndefined(previousSourceElement) && !isNullOrUndefined(newSourceElement)) {
        // ---------------------------
        // Existing Key
        // ---------------------------
        const origElementKey = wrappedSourceNode.makeCollectionKey(previousSourceElement);
        const newElementKey = wrappedSourceNode.makeCollectionKey(newSourceElement);

        if (origElementKey !== newElementKey) {
          // ---------------------------
          // Keys don't match - REPLACE
          // ---------------------------
          const newRdo = this.makeRdoElement(newElementKey);

          // Replace operation
          this.value.splice(i + offset, 1, newRdo);

          // Publish
          this.eventEmitter.publish('nodeChange', {
            changeType: 'replace',
            sourceNodeTypePath: wrappedSourceNode.sourceNodeTypePath,
            index,
            sourceKey: newElementKey,
            rdoKey: newElementKey,
            previousSourceValue: undefined,
            newSourceValue: newSourceElement,
          });
        } else {
          // ---------------------------
          // Keys Match - UPDATE
          // ---------------------------
          if (this.equalityComparer(previousSourceElement, newSourceElement)) {
            // No change, no patch needed
          } else {
            // Update operation
            // DevNote: We are assuming that primitive values will not make it to this point, as their keys will always be different. No need for additional primitive check
            changed = this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemValue: this.value[index], rdoNodeItemKey: newElementKey, sourceNodeItemKey: newElementKey }) && changed;

            this.eventEmitter.publish('nodeChange', {
              changeType: 'update',
              sourceNodeTypePath: wrappedSourceNode.sourceNodeTypePath,
              index,
              sourceKey: newElementKey,
              rdoKey: newElementKey,
              previousSourceValue: previousSourceElement,
              newSourceValue: newSourceElement,
            });
          }
        }
      } else if (!isNullOrUndefined(previousSourceElement) && isNullOrUndefined(newSourceElement)) {
        // ---------------------------
        // Missing Key - DELETE
        // ---------------------------

        // Delete operation
        this.value.splice(index, 1);
        changed = true;
        offset--;

        this.eventEmitter.publish('nodeChange', {
          changeType: 'update',
          sourceNodeTypePath: wrappedSourceNode.sourceNodeTypePath,
          index,
          sourceKey: undefined,
          rdoKey: undefined,
          previousSourceValue: previousSourceElement,
          newSourceValue: newSourceElement,
        });
      }
    }

    // Update NodeCache
    mutableNodeCacheItem.sourceData = newSourceArray;

    return changed;
  }

  protected syncPartialConvert({ wrappedSourceNode, mutableNodeCacheItem }: { wrappedSourceNode: ISourceCollectionNodeWrapper<K, S, D>; mutableNodeCacheItem: MutableCachedNodeItemType<K, S, D> }): CollectionNodePatchOperation<K, D>[] {
    const operations = new Array<CollectionNodePatchOperation<K, D>>();
    const origSourceArray = mutableNodeCacheItem.sourceData;
    const rdoMap = mutableNodeCacheItem.rdoMap;
    const newSourceArray = this.wrappedSourceNode.value as Array<S>;
    const count = Math.max(origSourceArray.length, newSourceArray.length);
    let offset = 0; // use offset to adjust index based on additions and removals

    for (let i = 0; i < count; i++) {
      const previousSourceElement = origSourceArray[i];
      const newSourceElement = newSourceArray[i];
      let op: NodePatchOperationType | undefined;

      if (isNullOrUndefined(previousSourceElement) && !isNullOrUndefined(newSourceElement)) {
        // ---------------------------
        // New Key
        // ---------------------------
        const newElementKey = wrappedSourceNode.makeCollectionKey(newSourceElement);
        const newRdo = this.makeRdoElement(newSourceElement);

        // Add operation
        this.value.splice(i + offset, 0, newRdo);
        offset++;

        // If not primitive, sync so child nodes are hydrated
        if (NodeTypeUtils.isPrimitive(newRdo)) this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemValue: newRdo, rdoNodeItemKey: newElementKey, sourceNodeItemKey: newElementKey });

        // Publish
        this.eventEmitter.publish('nodeChange', {
          changeType: 'add',
          sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath,
          sourceKey: newElementKey,
          rdoKey: newElementKey,
          previousSourceValue: undefined,
          newSourceValue: newSourceElement,
        });

        // Update Rdo Map
        rdoMap.set(newElementKey, newRdo);
      } else if (!isNullOrUndefined(previousSourceElement) && !isNullOrUndefined(newSourceElement)) {
        // ---------------------------
        // Existing Key
        // ---------------------------

        const origElementKey = wrappedSourceNode.makeCollectionKey(previousSourceElement);
        const newElementKey = wrappedSourceNode.makeCollectionKey(newSourceElement);

        if (origElementKey !== newElementKey) {
          // ---------------------------
          // Keys don't match
          // ---------------------------
          const origRdo = rdoMap.get(origElementKey);
          if (!origRdo) throw new Error(`Could not find original Rdo with key ${origElementKey}`);
          const newRdo = this.makeRdoElement(newSourceElement);

          // Add operations
          operations.push({ op: 'delete', index: i, key: origElementKey, previousSourceValue: previousSourceElement, newSourceValue: newSourceElement, rdo: origRdo });
          operations.push({ op: 'add', index: i, key: newElementKey, previousSourceValue: previousSourceElement, newSourceValue: newSourceElement, rdo: newRdo });

          // Update Rdo Map
          rdoMap.delete(origElementKey);
          rdoMap.set(newElementKey, newRdo);
        } else {
          // ---------------------------
          // Keys Match
          // ---------------------------
          if (this._equalityComparer(previousSourceElement, newSourceElement)) {
            // No change, no patch needed
          } else {
            // Add operations
            operations.push({ op: 'update', index: i, key: origElementKey, previousSourceValue: previousSourceElement, newSourceValue: newSourceElement });

            // Update Rdo Map
            // No update needed
          }
        }
      } else if (!isNullOrUndefined(previousSourceElement) && isNullOrUndefined(newSourceElement)) {
        // ---------------------------
        // Missing Key
        // ---------------------------
        const origElementKey = wrappedSourceNode.makeCollectionKey(previousSourceElement);
        const origRdo = rdoMap.get(origElementKey);
        if (!origRdo) throw new Error(`Could not find original Rdo with key ${origElementKey}`);

        // Add operations
        operations.push({ op: 'delete', index: i, key: wrappedSourceNode.makeCollectionKey(previousSourceElement), previousSourceValue: previousSourceElement, newSourceValue: newSourceElement, rdo: origRdo });

        // Update Rdo Map
        rdoMap.delete(origElementKey);
      }
    }

    return operations;
  }

  public executePatchOperations(patchOperations: CollectionNodePatchOperation<K, D>[]) {
    // Loop through and execute (note, the operations are in descending order by index

    for (const patchOp of patchOperations) {
      // EXECUTE
      switch (patchOp.op) {
        case 'add':
          if (!patchOp.rdo) throw new Error(`Rdo must not be null for patch-add operations - sourceNodeTypePath:${this.wrappedSourceNode.sourceNodeTypePath},  Key:${patchOp.key}`);
          this.value.add(patchOp.rdo);
          // If primitive, break. Else, fall through to update, so the values sync to the new item
          if (NodeTypeUtils.isPrimitive(patchOp.rdo)) break;
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

      // Publish
      this.eventEmitter.publish('nodeChange', {
        changeType: patchOp.op,
        sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath,
        sourceKey: patchOp.key,
        rdoKey: patchOp.key,
        previousSourceValue: patchOp.previousSourceValue,
        newSourceValue: patchOp.newSourceValue,
      });
    }
  }
}
