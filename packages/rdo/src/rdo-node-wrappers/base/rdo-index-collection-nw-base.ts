import { IGlobalNodeOptions, INodeSyncOptions, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { Logger } from '../../infrastructure/logger';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { IEqualityComparer, IRdoInternalNodeWrapper, ISourceCollectionNodeWrapper, NodeChangeHandler } from '../../types';
import { NodeChange } from '../../types/event-types';
import { RdoCollectionNWBase } from './rdo-collection-nw-base';

const logger = Logger.make('RdoCollectionNWBase');
type RdoIndexCollectionNWBaseLastData<K, S, D> = { sourceArray: Array<S>; keyByIndexMap: Map<number, K>; rdoByIndexMap: Map<number, D>; rdoByKeyMap: Map<K, D> };

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
  private get last(): RdoIndexCollectionNWBaseLastData<K, S, D> {
    let mutableNodeCacheItem = this.mutableNodeCache.get<RdoIndexCollectionNWBaseLastData<K, S, D>>({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath, dataKey: 'RdoIndexCollectionNWBase' });
    if (!mutableNodeCacheItem) {
      mutableNodeCacheItem = { sourceArray: new Array<S>(), keyByIndexMap: new Map<number, K>(), rdoByIndexMap: new Map<number, D>(), rdoByKeyMap: new Map<K, D>() };
      this.mutableNodeCache.set({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath, dataKey: 'RdoIndexCollectionNWBase', data: mutableNodeCacheItem });
    }
    return mutableNodeCacheItem;
  }

  /** */
  public smartSync(): boolean {
    //
    // Setup
    let changed = false;
    const wrappedSourceNode = this.wrappedSourceNode as ISourceCollectionNodeWrapper<K, S, D>;
    const next = {
      sourceArray: wrappedSourceNode.elements(),
      keyByIndexMap: new Map<number, K>(),
      rdoByIndexMap: this.last.rdoByIndexMap,
      rdoByKeyMap: this.last.rdoByKeyMap,
    };

    //
    // Loop and execute
    let indexOffset = 0;
    for (let i = 0; i < wrappedSourceNode.childElementCount(); i++) {
      // SETUP
      const previousSourceElement = this.last.sourceArray[i];
      const newSourceElement = next.sourceArray[i];
      const index = i + indexOffset;
      const elementKey = wrappedSourceNode.makeCollectionKey(newSourceElement, index);
      next.keyByIndexMap.set(i, elementKey);

      // ---------------------------
      // New Index - ADD
      // ---------------------------
      // If index is not in previous source array, but in new source array
      if (this.last.sourceArray[i] === null || this.last.sourceArray[i] === undefined) {
        // EXECUTE
        const newRdo = this.makeRdoElement(newSourceElement);
        changed = this.handleAddElement({ addHandler: this.onNewIndex, index, elementKey, newRdo, newSourceElement }) && changed;
        next.rdoByIndexMap.set(i, newRdo);
        next.rdoByKeyMap.set(elementKey, newRdo);

        // Update local values
        indexOffset++;
        next.sourceArray.push(newSourceElement);
      } else {
        if (this.equalityComparer(this.last.sourceArray[i], newSourceElement)) {
          // No change, no patch needed
        } else {
          // ---------------------------
          // REPLACE
          // ---------------------------
          // If non-equal primitive with same indexes, just do a replace operation
          this.handleReplaceOrUpdate({ replaceHandler: this.onReplaceIndex, index, elementKey, newRdo: this.makeRdoElement(newSourceElement), newSourceElement, previousSourceElement });
        }

        // Update local values that don't depend on lifecycle method executing
        next.sourceArray.push(newSourceElement);
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
        next.rdoByIndexMap.delete(i);
        next.rdoByKeyMap.delete(elementKey); // TODO - should only delete if last key. How do we know??
      }
    }

    // Update nodeInstanceCache
    this.last.sourceArray = next.sourceArray;
    this.last.keyByIndexMap = next.keyByIndexMap;
    this.last.rdoByIndexMap = next.rdoByIndexMap;
    this.last.rdoByKeyMap = next.rdoByKeyMap;

    return changed;
  }

  /** */
  protected abstract onNewIndex: NodeChangeHandler<K>;
  protected abstract onReplaceIndex: NodeChangeHandler<K>;
  protected abstract onDeleteIndex: NodeChangeHandler<K>;
}
