import _ from 'lodash';
import { IGlobalNodeOptions, INodeSyncOptions, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { Logger } from '../../infrastructure/logger';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { IEqualityComparer, IRdoInternalNodeWrapper, ISourceCollectionNodeWrapper, NodeReplaceHandler, NodeAddHandler, NodeDeleteHandler } from '../../types';
import { NodeChange } from '../../types/event-types';
import { RdoCollectionNWBase } from './rdo-collection-nw-base';

const logger = Logger.make('RdoCollectionNWBase');
export type RdoKeyCollectionNWBaseViews<K, S, D> = { sourceArray: Array<S>; sourceByKeyMap: Map<K, S>; rdoByKeyMap: Map<K, D> };

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
  protected get views(): RdoKeyCollectionNWBaseViews<K, S, D> {
    let mutableNodeCacheItem = this.mutableNodeCache.get<RdoKeyCollectionNWBaseViews<K, S, D>>({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath, dataKey: 'RdoIndexCollectionNWBase' });
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

    const last = {
      sourceArray: this.views.sourceArray,
      sourceByKeyMap: this.views.sourceByKeyMap,
      rdoByKeyMap: this.views.rdoByKeyMap,
    };

    this.views.sourceArray = wrappedSourceNode.elements();
    this.views.sourceByKeyMap = new Map<K, S>();
    this.views.rdoByKeyMap = new Map<K, D>();

    //
    // Loop and execute
    let indexOffset = 0;
    for (let i = 0; i < wrappedSourceNode.childElementCount(); i++) {
      // SETUP
      const nextSourceElement = this.views.sourceArray[i];
      const index = i + indexOffset;
      const elementKey = wrappedSourceNode.makeCollectionKey(nextSourceElement, i);
      // Update maps
      if (this.views.sourceByKeyMap.has(elementKey)) continue; // If we have already seen the key, no need to add/update
      this.views.sourceByKeyMap.set(elementKey, nextSourceElement);

      // ---------------------------
      // New key - ADD
      // ---------------------------
      // If rdo not in previous, add
      if (!last.rdoByKeyMap.has(elementKey)) {
        // EXECUTE
        const newRdo = this.makeRdoElement(nextSourceElement);

        // Tracking
        this.views.rdoByKeyMap.set(elementKey, newRdo);
        indexOffset++;

        // Handle
        changed = this.handleAddElement({ addHandler: this.onNewKey, index, elementKey, newRdo, newSourceElement: nextSourceElement }) && changed;

        // If index is in previous source array
      } else {
        const lastSourceElement = last.sourceByKeyMap.get(elementKey)!;
        const lastRdo = last.rdoByKeyMap.get(elementKey);
        if (this.equalityComparer(lastSourceElement, nextSourceElement)) {
          // No change, no patch needed. Just update view
          const lastRdo = last.rdoByKeyMap.get(elementKey);
          this.views.rdoByKeyMap.set(elementKey, lastRdo!);
        } else {
          // ---------------------------
          // REPLACE or UPDATE
          // ---------------------------

          // Tracking
          this.views.rdoByKeyMap.set(elementKey, lastRdo!);

          // Handle
          const result = this.handleReplaceOrUpdate({ replaceHandler: this.onReplaceKey, index, elementKey, lastRdo, newSourceElement: nextSourceElement, previousSourceElement: lastSourceElement });

          // Add result in case element replaced
          this.views.rdoByKeyMap.set(elementKey, result.nextRdo);
        }
      }
    }

    const nextKeys = Array.from(this.views.rdoByKeyMap.keys());
    const lastKeys = Array.from(last.rdoByKeyMap.keys());
    const missingKeys = _.difference(lastKeys, nextKeys);
    if (missingKeys.length > 0) {
      // ---------------------------
      // Missing Index - DELETE
      // ---------------------------
      for (const elementKey of missingKeys) {
        const previousSourceElement = last.sourceByKeyMap.get(elementKey)!;
        const rdoToDelete = last.rdoByKeyMap.get(elementKey);
        changed = this.handleDeleteElement({ deleteHandler: this.onDeleteKey, index: undefined, elementKey, rdoToDelete, previousSourceElement }) && changed;
      }
    }

    return changed;
  }

  public getSourceNodeKeys() {
    return this.views.sourceByKeyMap.keys();
  }

  public getSourceNodeItem(key: K) {
    return this.views.sourceByKeyMap.get(key);
  }

  public getRdoNodeItem(key: K) {
    return this.views.rdoByKeyMap.get(key);
  }

  /** */
  protected abstract onNewKey: NodeAddHandler<K>;
  protected abstract onReplaceKey: NodeReplaceHandler<K>;
  protected abstract onDeleteKey: NodeDeleteHandler<K>;
}
