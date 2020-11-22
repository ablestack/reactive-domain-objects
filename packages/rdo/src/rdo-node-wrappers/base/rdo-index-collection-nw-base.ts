import { IGlobalNodeOptions, INodeSyncOptions, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { Logger } from '../../infrastructure/logger';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { IEqualityComparer, IRdoInternalNodeWrapper, ISourceCollectionNodeWrapper, NodeAddHandler, NodeDeleteHandler, NodeReplaceHandler } from '../../types';
import { NodeChange } from '../../types/event-types';
import { RdoCollectionNWBase } from './rdo-collection-nw-base';

const logger = Logger.make('RdoCollectionNWBase');
export type RdoIndexCollectionNWBaseViews<S, D> = { sourceArray: Array<S>; keyByIndexMap: Map<number, string | number>; rdoByIndexMap: Map<number, D> };

export abstract class RdoIndexCollectionNWBase<S, D> extends RdoCollectionNWBase<S, D> {
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
    key: number | undefined;
    mutableNodeCache: MutableNodeCache;
    wrappedParentRdoNode: IRdoInternalNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S, D>;
    defaultEqualityComparer: IEqualityComparer;
    syncChildNode: ISyncChildNode;
    matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
    globalNodeOptions: IGlobalNodeOptions | undefined;
    targetedOptionMatchersArray: Array<INodeSyncOptions<any, any>>;
    eventEmitter: EventEmitter<NodeChange>;
  }) {
    super({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
  }

  //------------------------------
  // Protected
  //------------------------------
  protected get views(): RdoIndexCollectionNWBaseViews<S, D> {
    let mutableNodeCacheItem = this.mutableNodeCache.get<RdoIndexCollectionNWBaseViews<S, D>>({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath, dataKey: 'RdoIndexCollectionNWBase' });
    if (!mutableNodeCacheItem) {
      mutableNodeCacheItem = { sourceArray: new Array<S>(), keyByIndexMap: new Map<number, string | number>(), rdoByIndexMap: new Map<number, D>() };
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
    const wrappedSourceNode = this.wrappedSourceNode as ISourceCollectionNodeWrapper<S, D>;

    const last = {
      sourceArray: this.views.sourceArray,
      keyByIndexMap: this.views.keyByIndexMap,
      rdoByIndexMap: this.views.rdoByIndexMap,
    };

    this.views.sourceArray = wrappedSourceNode.elements();
    this.views.keyByIndexMap = new Map<number, string | number>();
    this.views.rdoByIndexMap = new Map<number, D>();

    //
    // Loop and execute
    let indexOffset = 0;
    for (let i = 0; i < wrappedSourceNode.childElementCount(); i++) {
      // SETUP
      const nextSourceElement = this.views.sourceArray[i];
      const index = i + indexOffset;

      // Update maps
      const elementKey = wrappedSourceNode.makeCollectionKey(nextSourceElement, i);
      this.views.keyByIndexMap.set(i, elementKey);

      // ---------------------------
      // New Index - ADD
      // ---------------------------
      // If rdo not in previous, add
      if (!last.rdoByIndexMap.has(i)) {
        // EXECUTE
        const newItem = this.makeRdoElement(nextSourceElement);

        // Tracking
        this.views.rdoByIndexMap.set(i, newItem);
        indexOffset++;

        // Handle
        changed = this.handleAddElement({ addHandler: this.onAdd, index, collectionKey: i, newItem, newSourceElement: nextSourceElement }) && changed;

        // If index is in previous source array
      } else {
        const lastSourceElement = last.sourceArray[i];
        if (this.equalityComparer(lastSourceElement, nextSourceElement)) {
          // No change, no patch needed. Just update view
          this.views.rdoByIndexMap.set(i, last.rdoByIndexMap.get(index)!);
        } else {
          // ---------------------------
          // REPLACE or UPDATE
          // ---------------------------

          // Tracking
          const origItem = last.rdoByIndexMap.get(i)!;
          this.views.rdoByIndexMap.set(i, origItem);

          // Handle
          const lastElementKey = last.keyByIndexMap.get(i)!;
          const result = this.handleReplaceOrUpdate({
            replaceHandler: ({ index, key, origItem, newItem }) => {
              this.views.rdoByIndexMap.set(i, newItem);
              return this.onReplace({ index, key, origItem, newItem });
            },
            index,
            collectionKey: i,
            lastElementKey,
            nextElementKey: elementKey,
            origItem: lastSourceElement,
            newSourceElement: nextSourceElement,
            previousSourceElement: lastSourceElement,
          });

          // Add result in case element replaced
          this.views.rdoByIndexMap.set(i, result.newItem);
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
        const rdoToDelete = last.rdoByIndexMap.get(i);

        // Handle
        changed = this.handleDeleteElement({ deleteHandler: this.onDelete, index, collectionKey: i, rdoToDelete, previousSourceElement }) && changed;
      }
    }

    // Update nodeInstanceCache
    last.sourceArray = this.views.sourceArray;
    last.rdoByIndexMap = this.views.rdoByIndexMap;

    return changed;
  }

  public getSourceNodeKeys() {
    return this.views.sourceArray.keys();
  }

  public getSourceNodeItem(key: number) {
    return this.views.sourceArray[key];
  }

  public getRdoNodeItem(key: number) {
    return this.views.rdoByIndexMap.get(key);
  }

  /** */
  protected abstract onAdd: NodeAddHandler<D>;
  protected abstract onReplace: NodeReplaceHandler<D>;
  protected abstract onDelete: NodeDeleteHandler<D>;
}
