import { IGlobalNodeOptions, INodeSyncOptions, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { Logger } from '../../infrastructure/logger';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { IEqualityComparer, IRdoInternalNodeWrapper, ISourceCollectionNodeWrapper, NodeAddHandler, NodeDeleteHandler, NodeReplaceHandler } from '../../types';
import { NodeChange } from '../../types/event-types';
import { RdoCollectionNWBase } from './rdo-collection-nw-base';

const logger = Logger.make('RdoCollectionNWBase');
export type RdoIndexCollectionNWBaseViews<K, S, D> = { sourceArray: Array<S>; keyByIndexMap: Map<number, K>; rdoByIndexMap: Map<number, D>; indexByKeyMap: Map<K, number> };

export abstract class RdoIndexCollectionNWBase<K extends string | number, S, D> extends RdoCollectionNWBase<K, S, D> {
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
    super({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
  }

  //------------------------------
  // Protected
  //------------------------------
  protected get views(): RdoIndexCollectionNWBaseViews<K, S, D> {
    let mutableNodeCacheItem = this.mutableNodeCache.get<RdoIndexCollectionNWBaseViews<K, S, D>>({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath, dataKey: 'RdoIndexCollectionNWBase' });
    if (!mutableNodeCacheItem) {
      mutableNodeCacheItem = { sourceArray: new Array<S>(), keyByIndexMap: new Map<number, K>(), rdoByIndexMap: new Map<number, D>(), indexByKeyMap: new Map<K, number>() };
      this.mutableNodeCache.set({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath, dataKey: 'RdoIndexCollectionNWBase', data: mutableNodeCacheItem });
    }
    return mutableNodeCacheItem;
  }

  //------------------------------
  // Public
  //------------------------------
  public smartSync(): boolean {
    //
    // Setup
    let changed = false;
    const wrappedSourceNode = this.wrappedSourceNode as ISourceCollectionNodeWrapper<K, S, D>;

    const last = {
      sourceArray: this.views.sourceArray,
      keyByIndexMap: this.views.keyByIndexMap,
      indexByKeyMap: this.views.indexByKeyMap,
      rdoByIndexMap: this.views.rdoByIndexMap,
    };

    this.views.sourceArray = wrappedSourceNode.elements();
    this.views.keyByIndexMap = new Map<number, K>();
    this.views.indexByKeyMap = new Map<K, number>();
    this.views.rdoByIndexMap = new Map<number, D>();

    //
    // Loop and execute
    let indexOffset = 0;
    for (let i = 0; i < wrappedSourceNode.childElementCount(); i++) {
      // SETUP
      const lastSourceElement = last.sourceArray[i];
      const nextSourceElement = this.views.sourceArray[i];
      const index = i + indexOffset;
      const elementKey = wrappedSourceNode.makeCollectionKey(nextSourceElement, i);
      // Update maps
      if (!this.views.indexByKeyMap.has(elementKey)) this.views.indexByKeyMap.set(elementKey, i);
      this.views.keyByIndexMap.set(i, elementKey);

      // ---------------------------
      // New Index - ADD
      // ---------------------------
      // If rdo not in previous, add
      if (!last.rdoByIndexMap.has(i)) {
        // EXECUTE
        const newRdo = this.makeRdoElement(nextSourceElement);

        // Tracking
        this.views.rdoByIndexMap.set(i, newRdo);
        indexOffset++;

        // Handle
        changed = this.handleAddElement({ addHandler: this.onNewIndex, index, elementKey, newRdo, newSourceElement: nextSourceElement }) && changed;

        // If index is in previous source array
      } else {
        const lastSourceElement = last.sourceArray[i];
        if (this.equalityComparer(lastSourceElement, nextSourceElement)) {
          // No change, no patch needed. Just update map
          this.views.rdoByIndexMap.set(i, last.rdoByIndexMap.get(index)!);
        } else {
          // ---------------------------
          // REPLACE or UPDATE
          // ---------------------------

          // Tracking
          const lastRdo = last.rdoByIndexMap.get(i)!;
          this.views.rdoByIndexMap.set(i, lastRdo);

          // Handle
          const result = this.handleReplaceOrUpdate({ replaceHandler: this.onReplaceIndex, index, elementKey, lastRdo: lastSourceElement, newSourceElement: nextSourceElement, previousSourceElement: lastSourceElement });

          // Add result in case element replaced
          this.views.rdoByIndexMap.set(i, result.nextRdo);
        }
      }
    }

    if (last.sourceArray.length > this.views.sourceArray.length) {
      // ---------------------------
      // Missing Index - DELETE
      // ---------------------------
      for (let i = this.views.sourceArray.length; i < last.sourceArray.length; i++) {
        const index = i + indexOffset;
        const previousSourceElement = last.sourceArray[i];
        const elementKey = last.keyByIndexMap.get(i)!;
        const rdoToDelete = last.rdoByIndexMap.get(i);

        // Handle
        changed = this.handleDeleteElement({ deleteHandler: this.onDeleteIndex, index, elementKey, rdoToDelete, previousSourceElement }) && changed;
      }
    }

    // Update nodeInstanceCache
    last.sourceArray = this.views.sourceArray;
    last.keyByIndexMap = this.views.keyByIndexMap;
    last.indexByKeyMap = this.views.indexByKeyMap;
    last.rdoByIndexMap = this.views.rdoByIndexMap;

    return changed;
  }

  public getSourceNodeKeys() {
    return this.views.indexByKeyMap.keys();
  }

  public getSourceNodeItem(key: K) {
    const index = this.views.indexByKeyMap.get(key);
    if (index === undefined) return;
    return this.views.sourceArray[index];
  }

  public getRdoNodeItem(key: K) {
    const index = this.views.indexByKeyMap.get(key);
    if (index === undefined) return;
    return this.views.rdoByIndexMap.get(index);
  }

  /** */
  protected abstract onNewIndex: NodeAddHandler<K>;
  protected abstract onReplaceIndex: NodeReplaceHandler<K>;
  protected abstract onDeleteIndex: NodeDeleteHandler<K>;
}
