import { IGlobalNodeOptions, INodeSyncOptions, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { Logger } from '../../infrastructure/logger';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { IEqualityComparer, IRdoInternalNodeWrapper, ISourceCollectionNodeWrapper, NodeAddHandler, NodeDeleteHandler, NodeReplaceHandler } from '../../types';
import { NodeChange } from '../../types/event-types';
import { RdoCollectionNWBase } from './rdo-collection-nw-base';

const logger = Logger.make('RdoCollectionNWBase');
export type RdoIndexCollectionNWBaseLastData<K, S, D> = { sourceArray: Array<S>; keyByIndexMap: Map<number, K>; rdoByIndexMap: Map<number, D>; indexByKeyMap: Map<K, number> };

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
  protected get last(): RdoIndexCollectionNWBaseLastData<K, S, D> {
    let mutableNodeCacheItem = this.mutableNodeCache.get<RdoIndexCollectionNWBaseLastData<K, S, D>>({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath, dataKey: 'RdoIndexCollectionNWBase' });
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
    const next = {
      sourceArray: wrappedSourceNode.elements(),
      keyByIndexMap: new Map<number, K>(),
      indexByKeyMap: new Map<K, number>(),
      rdoByIndexMap: new Map<number, D>(),
    };

    //
    // Loop and execute
    let indexOffset = 0;
    for (let i = 0; i < wrappedSourceNode.childElementCount(); i++) {
      // SETUP
      const lastSourceElement = this.last.sourceArray[i];
      const nextSourceElement = next.sourceArray[i];
      const index = i + indexOffset;
      const elementKey = wrappedSourceNode.makeCollectionKey(nextSourceElement, i);
      // Update maps
      next.keyByIndexMap.set(i, elementKey);
      if (!next.indexByKeyMap.has(elementKey)) next.indexByKeyMap.set(elementKey, i);

      // ---------------------------
      // New Index - ADD
      // ---------------------------
      // If index is not in previous source array, but in new source array. (In new source array by virtue of the fact we are looping here in the first place)
      if (this.last.keyByIndexMap.has(i)) {
        // EXECUTE
        const newRdo = this.makeRdoElement(nextSourceElement);
        changed = this.handleAddElement({ addHandler: this.onNewIndex, index, elementKey, newRdo, newSourceElement: nextSourceElement }) && changed;

        // Tracking
        next.rdoByIndexMap.set(i, newRdo);
        indexOffset++;
        next.sourceArray.push(nextSourceElement);

        // If index is in previous source array
      } else {
        const lastRdo = this.last.sourceArray[i];
        if (this.equalityComparer(lastRdo, nextSourceElement)) {
          // No change, no patch needed. Just update map
          next.rdoByIndexMap.set(i, this.last.rdoByIndexMap.get(index)!);
        } else {
          // ---------------------------
          // REPLACE or UPDATE
          // ---------------------------
          const result = this.handleReplaceOrUpdate({ replaceHandler: this.onReplaceIndex, index, elementKey, lastRdo, newSourceElement: nextSourceElement, previousSourceElement: lastSourceElement });

          // Update map
          next.rdoByIndexMap.set(i, result.nextRdo);
        }
      }
    }

    if (this.last.sourceArray.length > next.sourceArray.length) {
      // ---------------------------
      // Missing Index - DELETE
      // ---------------------------
      for (let i = next.sourceArray.length; i < this.last.sourceArray.length; i++) {
        const index = i + indexOffset;
        const previousSourceElement = this.last.sourceArray[i];
        const elementKey = this.last.keyByIndexMap.get(i)!;
        const rdoToDelete = this.last.rdoByIndexMap.get(i);
        changed = this.handleDeleteElement({ deleteHandler: this.onDeleteIndex, index, elementKey, rdoToDelete, previousSourceElement }) && changed;
      }
    }

    // Update nodeInstanceCache
    this.last.sourceArray = next.sourceArray;
    this.last.keyByIndexMap = next.keyByIndexMap;
    this.last.indexByKeyMap = next.indexByKeyMap;
    this.last.rdoByIndexMap = next.rdoByIndexMap;

    return changed;
  }

  /** */
  protected abstract onNewIndex: NodeAddHandler<K>;
  protected abstract onReplaceIndex: NodeReplaceHandler<K>;
  protected abstract onDeleteIndex: NodeDeleteHandler<K>;
}
