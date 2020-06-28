import { IGlobalNodeOptions, INodeSyncOptions, IRdoCollectionNodeWrapper, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo, NodeTypeUtils } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { Logger } from '../../infrastructure/logger';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { IEqualityComparer, IRdoInternalNodeWrapper, ISourceCollectionNodeWrapper } from '../../types';
import { NodeChange } from '../../types/event-types';
import { RdoInternalNWBase } from './rdo-internal-nw-base';

const logger = Logger.make('RdoCollectionNWBase');
type MutableCachedNodeItemType<K, S, D> = { sourceArray: Array<S>; sourceByIndexMap: Map<K, S>; keyByIndexMap: Map<number, K>; rdoByIndexMap: Map<number, D> };

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
      mutableNodeCacheItem = { sourceArray: new Array<S>(), sourceByIndexMap: new Map<K, S>(), rdoByIndexMap: new Map<number, D>(), keyByIndexMap: new Map<number, K>() };
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
  //   const rdoByIndexMap = mutableNodeCacheItem.rdoByIndexMap;
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
  //       operations.push({ op: 'add', index: i, key: newElementKey, previousSourceElement: previousSourceElement, newSourceValue: newSourceElement, rdo: newRdo });

  //       // Update Rdo Map
  //       rdoByIndexMap.set(newElementKey, newRdo);
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
  //         const origRdo = rdoByIndexMap.get(origElementKey);
  //         if (!origRdo) throw new Error(`Could not find original Rdo with key ${origElementKey}`);
  //         const newRdo = this.makeRdoElement(newElementKey);

  //         // Add operations
  //         operations.push({ op: 'delete', index: i, key: origElementKey, previousSourceElement: previousSourceElement, newSourceValue: newSourceElement, rdo: origRdo });
  //         operations.push({ op: 'add', index: i, key: newElementKey, previousSourceElement: previousSourceElement, newSourceValue: newSourceElement, rdo: newRdo });

  //         // Update Rdo Map
  //         rdoByIndexMap.delete(origElementKey);
  //         rdoByIndexMap.set(newElementKey, newRdo);
  //       } else {
  //         // ---------------------------
  //         // Keys Match
  //         // ---------------------------
  //         if (this._equalityComparer(previousSourceElement, newSourceElement)) {
  //           // No change, no patch needed
  //         } else {
  //           // Add operations
  //           operations.push({ op: 'update', index: i, key: origElementKey, previousSourceElement: previousSourceElement, newSourceValue: newSourceElement });

  //           // Update Rdo Map
  //           // No update needed
  //         }
  //       }
  //     } else if (!isNullOrUndefined(previousSourceElement) && isNullOrUndefined(newSourceElement)) {
  //       // ---------------------------
  //       // Missing Key
  //       // ---------------------------
  //       const origElementKey = wrappedSourceNode.makeCollectionKey(previousSourceElement);
  //       const origRdo = rdoByIndexMap.get(origElementKey);
  //       if (!origRdo) throw new Error(`Could not find original Rdo with key ${origElementKey}`);

  //       // Add operations
  //       operations.push({ op: 'delete', index: i, key: wrappedSourceNode.makeCollectionKey(previousSourceElement), previousSourceElement: previousSourceElement, newSourceValue: newSourceElement, rdo: origRdo });

  //       // Update Rdo Map
  //       rdoByIndexMap.delete(origElementKey);
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
    const previousSourceByIndexMap = mutableNodeCacheItem.sourceByIndexMap;
    const previousRdoByIndexMap = mutableNodeCacheItem.rdoByIndexMap;
    const wrappedSourceNode = this.wrappedSourceNode as ISourceCollectionNodeWrapper<K, S, D>;
    const newSourceArray = wrappedSourceNode.elements();
    const newSourceByIndexMap = new Map<K, S>();
    const newRdoByIndexMap = new Map<number, D>();
    const previousKeyByIndexMap = mutableNodeCacheItem.keyByIndexMap;
    const newKeyByIndexMap = new Map<number, K>();

    //
    // Loop and execute
    let indexOffset = 0;
    for (let i = 0; i < wrappedSourceNode.childElementCount(); i++) {
      // SETUP
      const previousSourceElement = previousSourceArray[i];
      const newSourceElement = newSourceArray[i];
      const index = i + indexOffset;
      const elementKey = wrappedSourceNode.makeCollectionKey(newSourceElement, index);
      newKeyByIndexMap.set(i, elementKey);

      // ---------------------------
      // New Index - ADD
      // ---------------------------
      // If index is not in previous source array, but in new source array
      if (previousSourceArray[i] === null || previousSourceArray[i] === undefined) {
        // EXECUTE
        changed = this.handleAddElement({ addHandler: this.onNewIndex, index, elementKey, newRdo: this.makeRdoElement(newSourceElement), newSourceElement }) && changed;

        // Update local values
        indexOffset++;
        newSourceArray.push(newSourceElement);
      } else {
        if (this.equalityComparer(previousSourceArray[i], newSourceElement)) {
          // No change, no patch needed
        } else {
          // ---------------------------
          // REPLACE
          // ---------------------------
          // If non-equal primitive with same indexes, just do a replace operation
          this.handleReplaceOrUpdate({ replaceHandler: this.onReplaceIndex, index, elementKey, newRdo: this.makeRdoElement(newSourceElement), newSourceElement, previousSourceElement });
        }

        // Update local values that don't depend on lifecycle method executing
        newSourceArray.push(newSourceElement);
      }
    }

    if (previousSourceArray.length > newSourceArray.length) {
      // ---------------------------
      // Missing Index - DELETE
      // ---------------------------
      for (let i = newSourceArray.length; i < previousSourceArray.length; i++) {
        const index = i + indexOffset;
        const previousSourceElement = previousSourceArray[i];
        const elementKey = previousKeyByIndexMap.get(i)!;
        const rdoToDelete = previousRdoByIndexMap.get(i);
        changed = this.handleDeleteElement({ deleteHandler: this.onDeleteIndex, index, elementKey, rdoToDelete, previousSourceElement }) && changed;
      }
    }

    // Update nodeInstanceCache
    mutableNodeCacheItem.keyByIndexMap = newKeyByIndexMap;
    mutableNodeCacheItem.rdoByIndexMap = newRdoByIndexMap;
    mutableNodeCacheItem.sourceArray = newSourceArray;
    mutableNodeCacheItem.sourceByIndexMap = newSourceByIndexMap;

    return changed;
  }

  /** */
  protected handleAddElement({ index, elementKey, newRdo, newSourceElement, addHandler }: { index: number; elementKey: K; newRdo: any; newSourceElement: S; addHandler: NodeChangeHandler<K> }) {
    const changed = addHandler({ index, key: elementKey, rdo: newRdo });

    if (changed) {
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
    }

    return changed;
  }

  protected handleReplaceOrUpdate({ replaceHandler, index, elementKey, newRdo, newSourceElement, previousSourceElement }: { index: number; elementKey: K; newRdo: any; newSourceElement: S; replaceHandler: NodeChangeHandler<K>; previousSourceElement: S }) {
    let changed = false;
    if (NodeTypeUtils.isPrimitive(newSourceElement)) {
      replaceHandler({ index, key: elementKey, rdo: newRdo });

      // Publish
      this.eventEmitter.publish('nodeChange', {
        changeType: 'replace',
        sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath,
        index,
        sourceKey: elementKey,
        rdoKey: elementKey,
        previousSourceValue: previousSourceElement,
        newSourceValue: newSourceElement,
      });

      changed = true;
    } else {
      // ---------------------------
      // UPDATE
      // ---------------------------
      // If non-equal non-primitive, step into child and sync
      changed = this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemKey: elementKey, sourceNodeItemKey: elementKey }) && changed;

      // Publish
      this.eventEmitter.publish('nodeChange', {
        changeType: 'update',
        sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath,
        index,
        sourceKey: elementKey,
        rdoKey: elementKey,
        previousSourceValue: previousSourceElement,
        newSourceValue: newSourceElement,
      });
    }
  }

  /** */
  protected handleDeleteElement({ deleteHandler, index, elementKey, rdoToDelete, previousSourceElement }: { index: number; elementKey: K; rdoToDelete: any; previousSourceElement: S; deleteHandler: NodeChangeHandler<K> }) {
    const changed = deleteHandler({ index, key: elementKey, rdo: rdoToDelete });

    // Publish
    this.eventEmitter.publish('nodeChange', {
      changeType: 'delete',
      sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath,
      index: index,
      sourceKey: elementKey,
      rdoKey: elementKey,
      previousSourceValue: previousSourceElement,
      newSourceValue: undefined,
    });

    return changed;
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
  //         this.eventEmitter.publish('nodeChange', { changeType: 'create', sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath, sourceKey: key, rdoKey: key, previousSourceElement: undefined, newSourceValue: sourceItem });
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
  //         this.eventEmitter.publish('nodeChange', { changeType: 'delete', sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath, sourceKey: key, rdoKey: key, previousSourceElement: deletedItem, newSourceValue: undefined });
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
  protected abstract onNewIndex: NodeChangeHandler<K>;
  protected abstract onNewKey: NodeChangeHandler<K>;
  protected abstract onReplaceIndex: NodeChangeHandler<K>;
  protected abstract onReplaceKey: NodeChangeHandler<K>;
  protected abstract onDeleteIndex: NodeChangeHandler<K>;
  protected abstract onDeleteKey: NodeChangeHandler<K>;
  public abstract getItem(key: K): D | null | undefined;
}
