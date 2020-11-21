import { IGlobalNodeOptions, INodeSyncOptions, IRdoCollectionNodeWrapper, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo, NodeTypeUtils } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { Logger } from '../../infrastructure/logger';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { IEqualityComparer, IRdoInternalNodeWrapper, NodeReplaceHandler, NodeAddHandler, NodeDeleteHandler } from '../../types';
import { NodeChange } from '../../types/event-types';
import { RdoInternalNWBase } from './rdo-internal-nw-base';

const logger = Logger.make('RdoCollectionNWBase');

export abstract class RdoCollectionNWBase<S, D> extends RdoInternalNWBase<S, D> implements IRdoCollectionNodeWrapper<S, D> {
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
    key: string | number | undefined;
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
    super({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
    this._equalityComparer = defaultEqualityComparer;
  }

  //------------------------------
  // Protected
  //------------------------------
  protected get equalityComparer() {
    return this._equalityComparer;
  }

  /** */
  protected handleAddElement({ index, collectionKey, newRdo, newSourceElement, addHandler }: { index: number; collectionKey: string | number; newRdo: any; newSourceElement: S; addHandler: NodeAddHandler }) {
    const changed = addHandler({ index, key: collectionKey, newRdo: newRdo });

    if (changed) {
      // If not primitive, sync so child nodes are hydrated
      if (!NodeTypeUtils.isPrimitive(newRdo)) this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemKey: collectionKey, sourceNodeItemKey: collectionKey });

      // Publish
      this.eventEmitter.publish('nodeChange', {
        changeType: 'add',
        sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath,
        sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath,
        index: index,
        sourceKey: collectionKey,
        rdoKey: collectionKey,
        previousSourceValue: undefined,
        newSourceValue: newSourceElement,
      });
    }

    return changed;
  }

  /** */
  protected handleReplaceOrUpdate({
    replaceHandler,
    index,
    collectionKey,
    lastElementKey,
    nextElementKey,
    origRdo,
    newSourceElement,
    previousSourceElement,
  }: {
    index: number;
    collectionKey: string | number;
    lastElementKey: string | number;
    nextElementKey: string | number;
    origRdo: any;
    newSourceElement: S;
    replaceHandler: NodeReplaceHandler;
    previousSourceElement: S;
  }) {
    let changed = false;
    const isPrimitive = NodeTypeUtils.isPrimitive(newSourceElement);

    // ---------------------------
    // REPLACE
    // ---------------------------
    // If non-equal primitive with same indexes, just do a replace operation
    if (lastElementKey !== nextElementKey || isPrimitive) {
      const newRdo = this.makeRdoElement(newSourceElement);
      replaceHandler({ index, key: collectionKey, origRdo, newRdo });

      // If not primitive, step into to sync
      if (!isPrimitive) {
        this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemKey: collectionKey, sourceNodeItemKey: collectionKey });
      }

      // Publish
      this.eventEmitter.publish('nodeChange', {
        changeType: 'replace',
        sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath,
        sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath,
        index,
        sourceKey: collectionKey,
        rdoKey: collectionKey,
        previousSourceValue: previousSourceElement,
        newSourceValue: newSourceElement,
      });

      return { changed: true, newRdo };
    } else {
      // ---------------------------
      // UPDATE
      // ---------------------------
      // If non-equal non-primitive, step into child and sync
      changed = this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemKey: collectionKey, sourceNodeItemKey: collectionKey }) && changed;

      // Publish
      this.eventEmitter.publish('nodeChange', {
        changeType: 'update',
        sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath,
        sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath,
        index,
        sourceKey: collectionKey,
        rdoKey: collectionKey,
        previousSourceValue: previousSourceElement,
        newSourceValue: newSourceElement,
      });

      return { changed, newRdo: this.getRdoNodeItem(collectionKey) };
    }
  }

  /** */
  protected handleDeleteElement({ deleteHandler, index, collectionKey, rdoToDelete, previousSourceElement }: { index?: number; collectionKey: string | number; rdoToDelete: any; previousSourceElement: S; deleteHandler: NodeDeleteHandler }) {
    const changed = deleteHandler({ index, key: collectionKey, origRdo: rdoToDelete });

    // Publish
    this.eventEmitter.publish('nodeChange', {
      changeType: 'delete',
      sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath,
      sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath,
      index: index,
      sourceKey: collectionKey,
      rdoKey: collectionKey,
      previousSourceValue: previousSourceElement,
      newSourceValue: undefined,
    });

    return changed;
  }

  public abstract elements(): Iterable<D>;
}
