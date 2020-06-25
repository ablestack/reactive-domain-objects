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
import _ from 'lodash';

const logger = Logger.make('RdoSetNW');
type MutableCachedNodeItemType<K, S, D> = { sourceData: Array<S>; sourceMap: Map<K, S>; rdoMap: Map<K, D> };

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
      mutableNodeCacheItem = { sourceData: new Array<S>(), sourceMap: new Map<K, S>(), rdoMap: new Map<K, D>() };
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
    const origSourceMap = mutableNodeCacheItem.sourceMap;
    const rdoMap = mutableNodeCacheItem.rdoMap;
    const wrappedSourceNode = this.wrappedSourceNode as ISourceCollectionNodeWrapper<K, S, D>;
    const newSourceArray = this.wrappedSourceNode.value as Array<S>;
    const newSourceMap = new Map<K, S>();
    const processedKeys = new Array<K>();

    //
    // Loop and build out sourceMap
    for (let i = 0; i < newSourceArray.length; i++) {
      const newElementKey = wrappedSourceNode.makeCollectionKey(newSourceArray[i], i);
      newSourceMap.set(newElementKey, newSourceArray[i]);
    }

    for (const sourceEntry of newSourceMap) {
      const elementKey = sourceEntry[0];
      const newSourceElement = sourceEntry[1];
      const previousSourceElement = origSourceMap.get(elementKey);
      processedKeys.push(elementKey);

      if (previousSourceElement === null || previousSourceElement === undefined) {
        // ---------------------------
        // New Key - ADD
        // ---------------------------
        const newRdo = this.makeRdoElement(newSourceElement);

        // Add operation
        this.value.add(newRdo);
        rdoMap.set(elementKey, newRdo);

        // If not primitive, sync so child nodes are hydrated
        if (NodeTypeUtils.isPrimitive(newRdo)) this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemValue: newRdo, rdoNodeItemKey: elementKey, sourceNodeItemKey: elementKey });

        // Publish
        this.eventEmitter.publish('nodeChange', {
          changeType: 'add',
          sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath,
          index: undefined,
          sourceKey: elementKey,
          rdoKey: elementKey,
          previousSourceValue: undefined,
          newSourceValue: newSourceElement,
        });
      } else {
        // ---------------------------
        // Existing Key
        // ---------------------------
        if (this.equalityComparer(previousSourceElement, newSourceElement)) {
          // No change, no patch needed
        } else {
          if (NodeTypeUtils.isPrimitive(newSourceElement)) {
            // ---------------------------
            // REPLACE
            // ---------------------------
            // If non-equal primitive with same keys
            // Assumption, this is not possible with Sets. Throw an error if we get here, because something is not as it is assumed to be!
            throw new Error('Sets should not result in non-equal items with the same sourceKey');
          } else {
            // ---------------------------
            // UPDATE
            // ---------------------------
            // If non-equal non-primitive, step into child and sync
            changed = this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemValue: rdoMap.get(elementKey), rdoNodeItemKey: elementKey, sourceNodeItemKey: elementKey }) && changed;

            // Publish
            this.eventEmitter.publish('nodeChange', {
              changeType: 'update',
              sourceNodeTypePath: wrappedSourceNode.sourceNodeTypePath,
              index: undefined,
              sourceKey: elementKey,
              rdoKey: elementKey,
              previousSourceValue: previousSourceElement,
              newSourceValue: newSourceElement,
            });
          }
        }
      }

      const origCollectionKeys = Array.from<K>(origSourceMap.keys());
      const keysInOrigOnly = _.difference(origCollectionKeys, processedKeys);
      if (keysInOrigOnly.length > 0) {
        keysInOrigOnly.forEach((origKey) => {
          // ---------------------------
          // Missing Index - DELETE
          // ---------------------------
          const deletedSourceElement = origSourceMap.get(origKey);

          // Delete operation
          const rdoToDelete = rdoMap.get(origKey);
          this._value.delete(rdoToDelete!);
          rdoMap.delete(elementKey);

          // Publish
          this.eventEmitter.publish('nodeChange', {
            changeType: 'delete',
            sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath,
            index: undefined,
            sourceKey: origKey,
            rdoKey: origKey,
            previousSourceValue: deletedSourceElement,
            newSourceValue: undefined,
          });
        });
        changed = true;
      }
    }

    // Update NodeCache
    mutableNodeCacheItem.sourceData = newSourceArray;
    mutableNodeCacheItem.sourceMap = newSourceMap;

    return changed;
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
