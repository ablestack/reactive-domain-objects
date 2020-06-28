import _ from 'lodash';
import { NodeTypeUtils, RdoCollectionNWBase } from '..';
import { IEqualityComparer, IGlobalNodeOptions, INodeSyncOptions, IRdoInternalNodeWrapper, ISourceCollectionNodeWrapper, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { Logger } from '../../infrastructure/logger';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { NodeChange } from '../../types/event-types';

const logger = Logger.make('RdoMapNW');
type MutableCachedNodeItemType<K, S> = { sourceArray: Array<S>; sourceMap: Map<K, S> };

export class RdoMapNW<K extends string | number, S, D> extends RdoCollectionNWBase<K, S, D> {
  private _value: Map<K, D>;

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
    value: Map<K, D>;
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
    this._value = value;
  }

  //------------------------------
  // Private
  //------------------------------
  protected getNodeInstanceCache(): MutableCachedNodeItemType<K, S> {
    let mutableNodeCacheItem = this.mutableNodeCache.get<MutableCachedNodeItemType<K, S>>({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath });
    if (!mutableNodeCacheItem) {
      mutableNodeCacheItem = { sourceArray: new Array<S>(), sourceMap: new Map<K, S>() };
      this.mutableNodeCache.set({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath, data: mutableNodeCacheItem });
    }
    return mutableNodeCacheItem;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get isLeafNode() {
    return false;
  }

  public get value() {
    return this._value;
  }

  // public itemKeys() {
  //   return this._value.keys();
  // }

  // public updateItem(key: K, value: D) {
  //   if (this._value.has(key)) {
  //     this._value.set(key, value);
  //     return true;
  //   } else return false;
  // }

  // public insertItem(key: K, value: D) {
  //   this._value.set(key, value);
  // }

  //------------------------------
  // IRdoInternalNodeWrapper
  //------------------------------
  public getItem(key: K) {
    return this._value.get(key);
  }

  // public smartSync(): boolean {
  //   if (this.wrappedSourceNode.childElementCount() === 0 && this.childElementCount() > 0) {
  //     return this.clearElements();
  //   } else {
  //     // Validate
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

  // public deleteElement(key: K): D | undefined {
  //   const item = this._value.get(key);
  //   this._value.delete(key);
  //   return item;
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
    const wrappedSourceNode = this.wrappedSourceNode as ISourceCollectionNodeWrapper<K, S, D>;
    const newSourceArray = this.wrappedSourceNode.value as Array<S>;
    const processedKeys = new Array<K>();

    //
    // Loop and execute
    for (const elementKey of wrappedSourceNode.nodeKeys()) {
      const newSourceElement = wrappedSourceNode.getItem(elementKey);
      const previousSourceElement = mutableNodeCacheItem.sourceMap.get(elementKey);
      processedKeys.push(elementKey);

      if (previousSourceElement === null || previousSourceElement === undefined) {
        // ---------------------------
        // New Key - ADD
        // ---------------------------
        const newRdo = this.makeRdoElement(newSourceElement);

        // Add operation
        this.value.set(elementKey, newRdo);

        // If not primitive, sync so child nodes are hydrated
        if (NodeTypeUtils.isPrimitive(newRdo)) this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemKey: elementKey, sourceNodeItemKey: elementKey });

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
            // If non-equal primitive with same keys, just do a replace operation
            this._value.set(elementKey, (newSourceElement as unknown) as D);

            // Publish
            this.eventEmitter.publish('nodeChange', {
              changeType: 'replace',
              sourceNodeTypePath: wrappedSourceNode.sourceNodeTypePath,
              index: undefined,
              sourceKey: elementKey,
              rdoKey: elementKey,
              previousSourceValue: previousSourceElement,
              newSourceValue: newSourceElement,
            });
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
              index: undefined,
              sourceKey: elementKey,
              rdoKey: elementKey,
              previousSourceValue: previousSourceElement,
              newSourceValue: newSourceElement,
            });
          }
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

    // Update NodeCache
    mutableNodeCacheItem.sourceArray = newSourceArray;
    mutableNodeCacheItem.sourceMap = newSourceMap;

    return changed;
  }
}
