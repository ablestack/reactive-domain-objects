import _ from 'lodash';
import { IGlobalNodeOptions, INodeSyncOptions, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { Logger } from '../../infrastructure/logger';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { IEqualityComparer, IRdoInternalNodeWrapper, ISourceCollectionNodeWrapper, NodeReplaceHandler, NodeAddHandler, NodeDeleteHandler } from '../../types';
import { NodeChange } from '../../types/event-types';
import { RdoCollectionNWBase } from './rdo-collection-nw-base';

const logger = Logger.make('RdoCollectionNWBase');
export type RdoKeyCollectionNWBaseLastData<K, S, D> = { sourceArray: Array<S>; sourceByKeyMap: Map<K, S>; rdoByKeyMap: Map<K, D> };

export abstract class RdoKeyCollectionNWBase<K extends string | number, S, D> extends RdoCollectionNWBase<K, S, D> {
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
  protected get last(): RdoKeyCollectionNWBaseLastData<K, S, D> {
    let mutableNodeCacheItem = this.mutableNodeCache.get<RdoKeyCollectionNWBaseLastData<K, S, D>>({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath, dataKey: 'RdoIndexCollectionNWBase' });
    if (!mutableNodeCacheItem) {
      mutableNodeCacheItem = { sourceArray: new Array<S>(), sourceByKeyMap: new Map<K, S>(), rdoByKeyMap: new Map<K, D>() };
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
      sourceByKeyMap: new Map<K, S>(),
      rdoByKeyMap: new Map<K, D>(),
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
      next.sourceByKeyMap.set(elementKey, nextSourceElement);
      if (next.rdoByKeyMap.has(elementKey)) continue; // If we have already seen the key, no need to add/update

      // ---------------------------
      // New Index - ADD
      // ---------------------------
      // If index is not in previous source array, but in new source array
      if (this.last.rdoByKeyMap.has(elementKey)) {
        // EXECUTE
        const newRdo = this.makeRdoElement(nextSourceElement);
        changed = this.handleAddElement({ addHandler: this.onNewKey, index, elementKey, newRdo, newSourceElement: nextSourceElement }) && changed;

        // Tracking
        next.rdoByKeyMap.set(elementKey, newRdo);
        indexOffset++;
        next.sourceArray.push(nextSourceElement);

        // If index is in previous source array
      } else {
        const lastRdo = this.last.rdoByKeyMap.get(elementKey);
        if (this.equalityComparer(lastRdo, nextSourceElement)) {
          // No change, no patch needed
        } else {
          // ---------------------------
          // REPLACE or UPDATE
          // ---------------------------
          const result = this.handleReplaceOrUpdate({ replaceHandler: this.onReplaceKey, index, elementKey, lastRdo, newSourceElement: nextSourceElement, previousSourceElement: lastSourceElement });

          // Update map
          next.rdoByKeyMap.set(elementKey, result.nextRdo);
        }
      }
    }

    const nextKeys = Array.from(next.rdoByKeyMap.keys());
    const lastKeys = Array.from(this.last.rdoByKeyMap.keys());
    const missingKeys = _.difference(lastKeys, nextKeys);
    if (missingKeys.length > 0) {
      // ---------------------------
      // Missing Index - DELETE
      // ---------------------------
      for (const elementKey of missingKeys) {
        const previousSourceElement = this.last.sourceByKeyMap.get(elementKey)!;
        const rdoToDelete = this.last.rdoByKeyMap.get(elementKey);
        changed = this.handleDeleteElement({ deleteHandler: this.onDeleteKey, index: undefined, elementKey, rdoToDelete, previousSourceElement }) && changed;
      }
    }

    // Update nodeInstanceCache
    this.last.sourceArray = next.sourceArray;
    this.last.sourceByKeyMap = next.sourceByKeyMap;
    this.last.rdoByKeyMap = next.rdoByKeyMap;

    return changed;
  }

  public getSourceNodeKeys() {
    return this.last.sourceByKeyMap.keys();
  }

  public getSourceNodeItem(key: K) {
    return this.last.sourceByKeyMap.get(key);
  }

  /** */
  protected abstract onNewKey: NodeAddHandler<K>;
  protected abstract onReplaceKey: NodeReplaceHandler<K>;
  protected abstract onDeleteKey: NodeDeleteHandler<K>;
}
