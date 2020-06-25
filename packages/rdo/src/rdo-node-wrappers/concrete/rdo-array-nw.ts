import { NodeTypeUtils, RdoCollectionNWBase } from '..';
import { CollectionNodePatchOperation, IEqualityComparer, IGlobalNodeOptions, INodeSyncOptions, IRdoInternalNodeWrapper, ISourceCollectionNodeWrapper, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { Logger } from '../../infrastructure/logger';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { NodeChange } from '../../types/event-types';
import { isNullOrUndefined } from '../utils/global.utils';

const logger = Logger.make('RdoArrayNW');
type MutableCachedNodeItemType<S> = { sourceArray: Array<S> };

export class RdoArrayNW<S, D> extends RdoCollectionNWBase<string, S, D> {
  private _value: Array<D>;

  constructor({
    value,
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
    value: Array<D>;
    typeInfo: NodeTypeInfo;
    key: string | undefined;
    mutableNodeCache: MutableNodeCache;
    wrappedParentRdoNode: IRdoInternalNodeWrapper<string, S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<string, S, D>;
    defaultEqualityComparer: IEqualityComparer;
    syncChildNode: ISyncChildNode;
    matchingNodeOptions: INodeSyncOptions<string, S, D> | undefined;
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
  protected getNodeInstanceCache(): MutableCachedNodeItemType<S> {
    let mutableNodeCacheItem = this.mutableNodeCache.get<MutableCachedNodeItemType<S>>({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath });
    if (!mutableNodeCacheItem) {
      mutableNodeCacheItem = { sourceArray: new Array<S>() };
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
  //   return CollectionUtils.Array.getCollectionKeys({ collection: this._value, makeCollectionKey: this.makeCollectionKey });
  // }

  // public getItem(key: string) {
  //   if (this.childElementCount() === 0) return undefined;
  //   const item = CollectionUtils.Array.getElement({ collection: this._value, makeCollectionKey: this.makeCollectionKey, key });
  //   return item;
  // }

  // public updateItem(key: string, value: D) {
  //   if (this.childElementCount() === 0) return false;
  //   return CollectionUtils.Array.updateElement({ collection: this._value, makeCollectionKey: this.makeCollectionKey, value });
  // }

  // public insertItem(key: string, value: D) {
  //   CollectionUtils.Array.insertElement({ collection: this._value, key, value });
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
  //     const changed = super.synchronizeCollection();

  //     return changed;
  //   }
  // }

  //------------------------------
  // IRdoCollectionNodeWrapper
  //------------------------------
  public elements(): Iterable<D> {
    return this._value;
  }

  public childElementCount(): number {
    return this._value.length;
  }

  // public deleteElement(key: string): D | undefined {
  //   return CollectionUtils.Array.deleteElement({ collection: this._value, makeCollectionKey: this.makeCollectionKey, key });
  // }

  // public clearElements(): boolean {
  //   return CollectionUtils.Array.clear({ collection: this._value });
  // }

  //------------------------------
  // RdoSyncableCollectionNW
  //------------------------------

  protected sync(): boolean {
    //
    // Setup
    let changed = false;
    const mutableNodeCacheItem = this.getNodeInstanceCache();
    const origSourceArray = mutableNodeCacheItem.sourceArray;
    const wrappedSourceNode = this.wrappedSourceNode as ISourceCollectionNodeWrapper<string, S, D>;
    const newSourceArray = this.wrappedSourceNode.value as Array<S>;
    const count = Math.max(origSourceArray.length, newSourceArray.length);
    let offset = 0; // use offset to adjust index based on additions and removals

    //
    // Loop
    for (let i = 0; i < count; i++) {
      const previousSourceElement = origSourceArray[i];
      const newSourceElement = newSourceArray[i];
      const index = i + offset;

      if (isNullOrUndefined(previousSourceElement) && !isNullOrUndefined(newSourceElement)) {
        // ---------------------------
        // New Index - ADD
        // ---------------------------
        const elementKey = wrappedSourceNode.makeCollectionKey(newSourceElement, index);
        const newRdo = this.makeRdoElement(newSourceElement);

        // Add operation
        this.value.splice(index, 0, newRdo);
        changed = true;
        offset++;

        // If not primitive, sync so child nodes are hydrated
        if (NodeTypeUtils.isPrimitive(newRdo)) this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemValue: newRdo, rdoNodeItemKey: elementKey, sourceNodeItemKey: elementKey });

        // Publish
        this.eventEmitter.publish('nodeChange', {
          changeType: 'add',
          sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath,
          index,
          sourceKey: elementKey,
          rdoKey: elementKey,
          previousSourceValue: undefined,
          newSourceValue: newSourceElement,
        });
      } else if (!isNullOrUndefined(previousSourceElement) && !isNullOrUndefined(newSourceElement)) {
        // ---------------------------
        // Existing Index
        // ---------------------------
        const origElementKey = wrappedSourceNode.makeCollectionKey(previousSourceElement, index);
        const newElementKey = wrappedSourceNode.makeCollectionKey(newSourceElement, index);

        if (origElementKey !== newElementKey) {
          // ---------------------------
          // Keys don't match - REPLACE
          // ---------------------------
          const newRdo = this.makeRdoElement(newSourceElement);

          // Replace operation
          this.value.splice(i + offset, 1, newRdo);

          // Publish
          this.eventEmitter.publish('nodeChange', {
            changeType: 'replace',
            sourceNodeTypePath: wrappedSourceNode.sourceNodeTypePath,
            index,
            sourceKey: newElementKey,
            rdoKey: newElementKey,
            previousSourceValue: undefined,
            newSourceValue: newSourceElement,
          });
        } else {
          // ---------------------------
          // Keys Match - UPDATE
          // ---------------------------
          if (this.equalityComparer(previousSourceElement, newSourceElement)) {
            // No change, no patch needed
          } else {
            if (NodeTypeUtils.isPrimitive(newSourceElement)) {
              // ---------------------------
              // REPLACE
              // ---------------------------
              // If non-equal primitive with same keys, just do a replace operation
              this.value.splice(i + offset, 1, this.makeRdoElement(newSourceElement));

              // Publish
              this.eventEmitter.publish('nodeChange', {
                changeType: 'replace',
                sourceNodeTypePath: wrappedSourceNode.sourceNodeTypePath,
                index,
                sourceKey: newElementKey,
                rdoKey: newElementKey,
                previousSourceValue: undefined,
                newSourceValue: newSourceElement,
              });
            } else {
              // ---------------------------
              // UPDATE
              // ---------------------------
              // If non-equal non-primitive, step into child and sync
              changed = this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemValue: this.value[index], rdoNodeItemKey: newElementKey, sourceNodeItemKey: newElementKey }) && changed;

              // Publish
              this.eventEmitter.publish('nodeChange', {
                changeType: 'update',
                sourceNodeTypePath: wrappedSourceNode.sourceNodeTypePath,
                index,
                sourceKey: newElementKey,
                rdoKey: newElementKey,
                previousSourceValue: previousSourceElement,
                newSourceValue: newSourceElement,
              });
            }
          }
        }
      } else if (!isNullOrUndefined(previousSourceElement) && isNullOrUndefined(newSourceElement)) {
        // ---------------------------
        // Missing Index - DELETE
        // ---------------------------

        // Delete operation
        this.value.splice(index, 1);
        changed = true;
        offset--;

        // Publish
        this.eventEmitter.publish('nodeChange', {
          changeType: 'update',
          sourceNodeTypePath: wrappedSourceNode.sourceNodeTypePath,
          index,
          sourceKey: undefined,
          rdoKey: undefined,
          previousSourceValue: previousSourceElement,
          newSourceValue: newSourceElement,
        });
      }
    }

    // Update NodeCache
    mutableNodeCacheItem.sourceArray = newSourceArray;

    return changed;
  }
}
