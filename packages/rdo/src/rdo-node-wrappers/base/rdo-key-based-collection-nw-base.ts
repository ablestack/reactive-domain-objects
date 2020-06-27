import { IGlobalNodeOptions, INodeSyncOptions, IRdoCollectionNodeWrapper, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo, NodeTypeUtils } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { Logger } from '../../infrastructure/logger';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { CollectionNodePatchOperation, IEqualityComparer, IRdoInternalNodeWrapper, isISourceCollectionNodeWrapper, ISourceCollectionNodeWrapper, NodePatchOperationType } from '../../types';
import { NodeChange } from '../../types/event-types';
import { isNullOrUndefined } from '../utils/global.utils';
import { RdoInternalNWBase } from './rdo-internal-nw-base';

const logger = Logger.make('RdoCollectionNWBase');
type MutableCachedNodeItemType<K, S, D> = { sourceArray: Array<S>; sourceMap: Map<K, S>; rdoMap: Map<K, D> };

export abstract class RdoCollectionNWBase<K extends string | number, S, D> extends RdoInternalNWBase<K, S, D> implements IRdoCollectionNodeWrapper<K, S, D> {
  private _equalityComparer: IEqualityComparer;

  constructor({
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
    super({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
    this._equalityComparer = defaultEqualityComparer;
  }

  //------------------------------
  // Private
  //------------------------------
  protected getNodeInstanceCache(): MutableCachedNodeItemType<K, S, D> {
    let mutableNodeCacheItem = this.mutableNodeCache.get<MutableCachedNodeItemType<K, S, D>>({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath });
    if (!mutableNodeCacheItem) {
      mutableNodeCacheItem = { sourceArray: new Array<S>(), sourceMap: new Map<K, S>(), rdoMap: new Map<K, D>() };
      this.mutableNodeCache.set({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath, data: mutableNodeCacheItem });
    }
    return mutableNodeCacheItem;
  }

  //------------------------------
  // Protected
  //------------------------------
  protected get equalityComparer() {
    return this._equalityComparer;
  }

  /** */
  // protected generatePatchOperations({ wrappedSourceNode, mutableNodeCacheItem }: { wrappedSourceNode: ISourceCollectionNodeWrapper<K, S, D>; mutableNodeCacheItem: MutableCachedNodeItemType<K, S, D> }): CollectionNodePatchOperation<K, D>[] {
  //   const operations = new Array<CollectionNodePatchOperation<K, D>>();
  //   const origSourceArray = mutableNodeCacheItem.sourceData;
  //   const rdoMap = mutableNodeCacheItem.rdoMap;
  //   const newSourceArray = this.wrappedSourceNode.value as Array<S>;
  //   const count = Math.max(origSourceArray.length, newSourceArray.length);

  //   for (let i = 0; i < count; i++) {
  //     const previousSourceElement = origSourceArray[i];
  //     const newSourceElement = newSourceArray[i];
  //     let op: NodePatchOperationType | undefined;

  //     if (isNullOrUndefined(previousSourceElement) && !isNullOrUndefined(newSourceElement)) {
  //       // ---------------------------
  //       // New Key
  //       // ---------------------------
  //       const newElementKey = wrappedSourceNode.makeCollectionKey(newSourceElement);
  //       const newRdo = this.makeRdoElement(newSourceElement);

  //       // Add operation
  //       operations.push({ op: 'add', index: i, key: newElementKey, previousSourceValue: previousSourceElement, newSourceValue: newSourceElement, rdo: newRdo });

  //       // Update Rdo Map
  //       rdoMap.set(newElementKey, newRdo);
  //     } else if (!isNullOrUndefined(previousSourceElement) && !isNullOrUndefined(newSourceElement)) {
  //       // ---------------------------
  //       // Existing Key
  //       // ---------------------------

  //       const origElementKey = wrappedSourceNode.makeCollectionKey(previousSourceElement);
  //       const newElementKey = wrappedSourceNode.makeCollectionKey(newSourceElement);

  //       if (origElementKey !== newElementKey) {
  //         // ---------------------------
  //         // Keys don't match
  //         // ---------------------------
  //         const origRdo = rdoMap.get(origElementKey);
  //         if (!origRdo) throw new Error(`Could not find original Rdo with key ${origElementKey}`);
  //         const newRdo = this.makeRdoElement(newElementKey);

  //         // Add operations
  //         operations.push({ op: 'delete', index: i, key: origElementKey, previousSourceValue: previousSourceElement, newSourceValue: newSourceElement, rdo: origRdo });
  //         operations.push({ op: 'add', index: i, key: newElementKey, previousSourceValue: previousSourceElement, newSourceValue: newSourceElement, rdo: newRdo });

  //         // Update Rdo Map
  //         rdoMap.delete(origElementKey);
  //         rdoMap.set(newElementKey, newRdo);
  //       } else {
  //         // ---------------------------
  //         // Keys Match
  //         // ---------------------------
  //         if (this._equalityComparer(previousSourceElement, newSourceElement)) {
  //           // No change, no patch needed
  //         } else {
  //           // Add operations
  //           operations.push({ op: 'update', index: i, key: origElementKey, previousSourceValue: previousSourceElement, newSourceValue: newSourceElement });

  //           // Update Rdo Map
  //           // No update needed
  //         }
  //       }
  //     } else if (!isNullOrUndefined(previousSourceElement) && isNullOrUndefined(newSourceElement)) {
  //       // ---------------------------
  //       // Missing Key
  //       // ---------------------------
  //       const origElementKey = wrappedSourceNode.makeCollectionKey(previousSourceElement);
  //       const origRdo = rdoMap.get(origElementKey);
  //       if (!origRdo) throw new Error(`Could not find original Rdo with key ${origElementKey}`);

  //       // Add operations
  //       operations.push({ op: 'delete', index: i, key: wrappedSourceNode.makeCollectionKey(previousSourceElement), previousSourceValue: previousSourceElement, newSourceValue: newSourceElement, rdo: origRdo });

  //       // Update Rdo Map
  //       rdoMap.delete(origElementKey);
  //     }
  //   }

  //   return operations;
  // }

  /** */
  public smartSync(): boolean {
    //
    // Setup
    let changed = false;
    const mutableNodeCacheItem = this.getNodeInstanceCache();
    const previousSourceArray = mutableNodeCacheItem.sourceArray;
    const previousSourceMap = mutableNodeCacheItem.sourceMap;
    const previousRdoMap = mutableNodeCacheItem.rdoMap;
    const wrappedSourceNode = this.wrappedSourceNode as ISourceCollectionNodeWrapper<K, S, D>;
    const newSourceArray = wrappedSourceNode.elements();
    const newSourceMap = new Map<K, S>();
    const newRdoMap = new Map<K, D>();
    const processedKeys = new Array<string>();

    //
    // Loop and execute
    let indexOffset = 0;
    for (let i = 0; i < wrappedSourceNode.childElementCount(); i++) {
      // SETUP
      const newSourceElement = newSourceArray[i];
      const index = i + indexOffset;
      const elementKey = wrappedSourceNode.makeCollectionKey(newSourceElement, index);
      let isNewKey = false;
      let newRdo: any;

      // Set key if new
      if (!newSourceMap.has(elementKey)) {
        newSourceMap.set(elementKey, newSourceElement);
        isNewKey = true;
      }

      // ---------------------------
      // New Index - ADD
      // ---------------------------
      // If index is not in previous source array, but in new source array
      if (previousSourceArray[i] === null || previousSourceArray[i] === undefined) {
        // Action
        if (this.onNewIndex) {
          newRdo = newRdo !== null && newRdo !== undefined ? newRdo : this.makeRdoElement(newSourceElement);

          // EXECUTE
          this.onNewIndex({ index, key: elementKey, newRdo });

          // If not primitive, sync so child nodes are hydrated
          if (NodeTypeUtils.isPrimitive(newRdo)) this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemKey: elementKey, sourceNodeItemKey: elementKey });

          // Publish
          this.eventEmitter.publish('nodeChange', {
            changeType: 'add',
            sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath,
            index: index,
            sourceKey: elementKey,
            rdoKey: elementKey,
            previousSourceValue: undefined,
            newSourceValue: newSourceElement,
          });

          // Update local values that depend on lifecycle method executing
          changed = changed && true;
          indexOffset++;
        }
        // Update local values that don't depend on lifecycle method executing
        newSourceArray.push(newSourceElement);
      }

      // ---------------------------
      // New Key - ADD
      // ---------------------------
      // If key is not in previous source array AND not in new source array already
      if ((previousSourceMap.get(elementKey) === null || previousSourceMap.get(elementKey) === undefined) && !newSourceMap.has(elementKey)) {
        newRdo = newRdo !== null && newRdo !== undefined ? newRdo : this.makeRdoElement(newSourceElement);

        // Action
        if (this.onNewKey) {
          this.onNewKey({ index, key: elementKey, newRdo });

          // If not primitive, sync so child nodes are hydrated
          if (NodeTypeUtils.isPrimitive(newRdo)) this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemKey: elementKey, sourceNodeItemKey: elementKey });

          // Publish
          this.eventEmitter.publish('nodeChange', {
            changeType: 'add',
            sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath,
            index: index,
            sourceKey: elementKey,
            rdoKey: elementKey,
            previousSourceValue: undefined,
            newSourceValue: newSourceElement,
          });

          // Update local values that depend on lifecycle method executing
          changed = changed && true;
        }
        // Update local values that don't depend on lifecycle method executing
        newSourceMap.set(elementKey, newSourceElement);
      }

      // ---------------------------
      // Existing Index
      // ---------------------------
      if (previousSourceArray[i] !== null && previousSourceArray[i] !== undefined) {
        if (this.equalityComparer(previousSourceArray[i], newSourceElement)) {
          // No change, no patch needed
        } else {
          // ---------------------------
          // REPLACE
          // ---------------------------
          // If non-equal primitive with same indexes, just do a replace operation
          if (NodeTypeUtils.isPrimitive(newSourceElement)) {
            if (this.onReplaceIndex) {
              newRdo = newRdo !== null && newRdo !== undefined ? newRdo : this.makeRdoElement(newSourceElement);
              this.onReplaceIndex({ index, key: elementKey, newRdo });

              // Publish
              this.eventEmitter.publish('nodeChange', {
                changeType: 'replace',
                sourceNodeTypePath: wrappedSourceNode.sourceNodeTypePath,
                index,
                sourceKey: elementKey,
                rdoKey: elementKey,
                previousSourceValue: previousSourceArray[i],
                newSourceValue: newSourceElement,
              });

              changed = true;
            }
          } else {
            // ---------------------------
            // UPDATE
            // ---------------------------
            // If non-equal non-primitive, step into child and sync
            changed = this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemKey: elementKey, sourceNodeItemKey: elementKey }) && changed;

            // Publish
            this.eventEmitter.publish('nodeChange', {
              changeType: 'update',
              sourceNodeTypePath: wrappedSourceNode.sourceNodeTypePath,
              index,
              sourceKey: elementKey,
              rdoKey: elementKey,
              previousSourceValue: previousSourceArray[i],
              newSourceValue: newSourceElement,
            });
          }
        }

        // Update local values that don't depend on lifecycle method executing
        newSourceArray.push(newSourceElement);
      }

      if (previousSourceMap.get(elementKey) !== null && previousSourceMap.get(elementKey) !== undefined && !newSourceMap.has(elementKey)) {
        // ---------------------------
        // Existing Key
        // ---------------------------
        if (this.equalityComparer(previousSourceMap.get(elementKey), newSourceElement)) {
          // No change, no patch needed
        } else {
          // ---------------------------
          // REPLACE
          // ---------------------------
          // If non-equal primitive with same keys, just do a replace operation
          if (NodeTypeUtils.isPrimitive(newSourceElement)) {
            if (this.onReplaceKey) {
              newRdo = newRdo !== null && newRdo !== undefined ? newRdo : this.makeRdoElement(newSourceElement);
              this.onReplaceKey({ index, key: elementKey, newRdo });

              // Publish
              this.eventEmitter.publish('nodeChange', {
                changeType: 'replace',
                sourceNodeTypePath: wrappedSourceNode.sourceNodeTypePath,
                index,
                sourceKey: elementKey,
                rdoKey: elementKey,
                previousSourceValue: previousSourceArray[i],
                newSourceValue: newSourceElement,
              });

              changed = true;
            }
          } else {
            // ---------------------------
            // UPDATE
            // ---------------------------
            // If non-equal non-primitive, step into child and sync
            changed = this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemKey: elementKey, sourceNodeItemKey: elementKey }) && changed;

            // Publish
            this.eventEmitter.publish('nodeChange', {
              changeType: 'update',
              sourceNodeTypePath: wrappedSourceNode.sourceNodeTypePath,
              index,
              sourceKey: elementKey,
              rdoKey: elementKey,
              previousSourceValue: previousSourceArray[i],
              newSourceValue: newSourceElement,
            });
          }
        }

        // Update local values that don't depend on lifecycle method executing
        newSourceMap.set(elementKey, newSourceElement);
      }
    }

    const origCollectionKeys = Array.from<K>(mutableNodeCacheItem.sourceMap.keys());
    const keysInOrigOnly = _.difference(origCollectionKeys, processedKeys);
    if (keysInOrigOnly.length > 0) {
      // ---------------------------
      // Missing Index - DELETE
      // ---------------------------
      keysInOrigOnly.forEach((origKey) => {
        // Delete operation
        const deletedItem = this._value.get(origKey);
        this._value.delete(origKey);

        // Publish
        this.eventEmitter.publish('nodeChange', { changeType: 'delete', sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath, index: undefined, sourceKey: origKey, rdoKey: origKey, previousSourceValue: deletedItem, newSourceValue: undefined });
      });
      changed = true;
    }
  }

  // protected synchronizeCollection() {
  //   let changed = false;
  //   const processedCollectionRdoKeys = new Array<K>();
  //   let targetCollectionInitiallyEmpty = this.childElementCount() === 0;

  //   if (this.wrappedSourceNode.childElementCount() > 0) {
  //     if (!isISourceCollectionNodeWrapper(this.wrappedSourceNode)) throw new Error('Can only sync Rdo collection types with Rdo source types');
  //     const sourceCollection = this.wrappedSourceNode.elements();

  //     for (const sourceItem of sourceCollection) {
  //       if (sourceItem === null || sourceItem === undefined) continue;
  //       // Make key

  //       const key = this.wrappedSourceNode.makeCollectionKey(sourceItem);
  //       if (!key) throw Error(`this.wrappedSourceNode.makeKey produced null or undefined. It must be defined when sourceCollection.length > 0`);
  //       let rdoKey = key;
  //       processedCollectionRdoKeys.push(rdoKey);

  //       // Get or create target item
  //       let targetItem: D | null | undefined = undefined;
  //       if (this.childElementCount() > 0) {
  //         targetItem = this.getItem(rdoKey);
  //       }

  //       // If no target item, Make
  //       if (targetItem === null || targetItem === undefined) {
  //         if (!this.makeRdoElement) throw Error(`sourceNodeTypePath: ${this.wrappedSourceNode.sourceNodeTypePath} - this.makeItem wan null or undefined. It must be defined when targetItem collection not empty`);
  //         targetItem = this.makeRdoElement(sourceItem);
  //         if (!targetItem) {
  //           throw Error(`sourceNodeTypePath: ${this.wrappedSourceNode.sourceNodeTypePath} - this.makeRdoElement produced null or undefined`);
  //         }
  //         this.insertItem(key, targetItem);
  //         changed = true;
  //         this.eventEmitter.publish('nodeChange', { changeType: 'create', sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath, sourceKey: key, rdoKey: key, previousSourceValue: undefined, newSourceValue: sourceItem });
  //       }

  //       // Update directly if Leaf node
  //       // Or else step into child and sync
  //       if (!sourceItem || NodeTypeUtils.isPrimitive(sourceItem)) {
  //         logger.trace(`Skipping child sync. Item '${key}' in collection is undefined, null, or Primitive`, sourceItem);
  //       } else {
  //         logger.trace(`Syncing item '${key}' in collection`, sourceItem);
  //         changed = this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemValue: targetItem, rdoNodeItemKey: key, sourceNodeItemKey: key }) && changed;
  //       }
  //     }
  //   }

  //   // short-cutting this check when initial collection was empty.
  //   // This id a performance optimization and also (indirectly)
  //   // allows for auto collection methods based on target item types
  //   if (!targetCollectionInitiallyEmpty) {
  //     if (!this.itemKeys) throw Error(`getTargetCollectionKeys wan null or undefined. It must be defined when targetCollection.length > 0`);
  //     if (!this.deleteElement) throw Error(`tryDeleteItemFromTargetCollection wan null or undefined. It must be defined when targetCollection.length > 0`);
  //     // If destination item missing from source - remove from destination
  //     const rdoCollectionKeys = Array.from<K>(this.itemKeys());
  //     const targetCollectionKeysInDestinationOnly = _.difference(rdoCollectionKeys, processedCollectionRdoKeys);
  //     if (targetCollectionKeysInDestinationOnly.length > 0) {
  //       targetCollectionKeysInDestinationOnly.forEach((key) => {
  //         const deletedItem = this.deleteElement(key);
  //         this.eventEmitter.publish('nodeChange', { changeType: 'delete', sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath, sourceKey: key, rdoKey: key, previousSourceValue: deletedItem, newSourceValue: undefined });
  //       });
  //       changed = true;
  //     }
  //   }

  //   return changed;
  // }

  //------------------------------
  // IRdoCollectionNodeWrapper
  //------------------------------
  // private _childElementSourceNodeKind: ChildElementsNodeKind | undefined = undefined;
  // public get childElementsNodeKind(): ChildElementsNodeKind {
  //   if (!this._childElementSourceNodeKind) {
  //     // Try and get element type from source collection
  //     const firstElement = this.elements()[Symbol.iterator]().next().value;
  //     if (firstElement) {
  //       this._childElementSourceNodeKind = NodeTypeUtils.getNodeType(firstElement).kind;
  //     } else this._childElementSourceNodeKind = null;
  //   }
  //   return this._childElementSourceNodeKind;
  // }

  // public makeCollectionKey = (item: D) => {
  //   // Use IMakeCollectionKey provided on options if available
  //   if (this.getNodeOptions()?.makeRdoCollectionKey?.fromRdoElement) {
  //     const key = this.getNodeOptions()!.makeRdoCollectionKey!.fromRdoElement(item);
  //     logger.trace(`makeCollectionKey - sourceNodeTypePath: ${this.wrappedSourceNode.sourceNodeTypePath} - making key from nodeOptions: ${key}`);
  //     return key;
  //   }

  //   if (isIMakeCollectionKey(this.value)) {
  //     const key = this.value.makeCollectionKeyFromRdoElement(item);
  //     logger.trace(`makeCollectionKey - sourceNodeTypePath: ${this.wrappedSourceNode.sourceNodeTypePath} - making key from IMakeCollectionKeyFromRdoElement: ${key}`);
  //     return key;
  //   }

  //   // If primitive, the item is the key
  //   if (NodeTypeUtils.isPrimitive(item)) {
  //     const key = item;
  //     logger.trace(`makeCollectionKey - sourceNodeTypePath: ${this.wrappedSourceNode.sourceNodeTypePath} - making key from Primitive value: ${key}`);
  //     return key;
  //   }

  //   // Look for idKey
  //   if (config.defaultIdKey in item) {
  //     const key = item[config.defaultIdKey];
  //     logger.trace(`makeCollectionKey - sourceNodeTypePath: ${this.wrappedSourceNode.sourceNodeTypePath} - making key from defaultIdKey: ${key}`);
  //     return key;
  //   }

  //   // Look for idKey with common postfix
  //   if (this.globalNodeOptions?.commonRdoFieldnamePostfix) {
  //     const defaultIdKeyWithPostfix = `${config.defaultIdKey}${this.globalNodeOptions.commonRdoFieldnamePostfix}`;
  //     if (defaultIdKeyWithPostfix in item) {
  //       const key = item[defaultIdKeyWithPostfix];
  //       logger.trace(`makeCollectionKey - sourceNodeTypePath: ${this.wrappedSourceNode.sourceNodeTypePath} - making key from defaultIdKeyWithPostfix: ${key}`);
  //       return key;
  //     }
  //   }

  //   throw new Error(`Path: ${this.wrappedSourceNode.sourceNodeTypePath} - could not find makeKeyFromRdoElement implementation either via config or interface. See documentation for details`);
  // };

  public abstract elements(): Iterable<D>;
  // public abstract clearElements();
  // public abstract insertItem(key: K, value: D);
  // public abstract deleteElement(key: K): D | undefined;
  protected abstract sync();
  protected onNewIndex?: (({ index, key, newRdo }: { index: number; key: K; newRdo: any }) => boolean) | undefined = undefined;
  protected onNewKey?: (({ index, key, newRdo }: { index: number; key: K; newRdo: any }) => boolean) | undefined = undefined;
  protected onReplaceIndex?: (({ index, key, newRdo }: { index: number; key: K; newRdo: any }) => boolean) | undefined = undefined;
  protected onReplaceKey?: (({ index, key, newRdo }: { index: number; key: K; newRdo: any }) => boolean) | undefined = undefined;
}
