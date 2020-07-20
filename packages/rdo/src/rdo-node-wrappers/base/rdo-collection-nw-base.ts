import { IGlobalNodeOptions, INodeSyncOptions, IRdoCollectionNodeWrapper, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo, NodeTypeUtils } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { Logger } from '../../infrastructure/logger';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { IEqualityComparer, IRdoInternalNodeWrapper, NodeReplaceHandler, NodeAddHandler, NodeDeleteHandler } from '../../types';
import { NodeChange } from '../../types/event-types';
import { RdoInternalNWBase } from './rdo-internal-nw-base';

const logger = Logger.make('RdoCollectionNWBase');

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
  // Protected
  //------------------------------
  protected get equalityComparer() {
    return this._equalityComparer;
  }

  /** */
  protected handleAddElement({ index, elementKey, newRdo, newSourceElement, addHandler }: { index: number; elementKey: K; newRdo: any; newSourceElement: S; addHandler: NodeAddHandler<K> }) {
    const changed = addHandler({ index, key: elementKey, nextRdo: newRdo });

    if (changed) {
      // If not primitive, sync so child nodes are hydrated
      if (!NodeTypeUtils.isPrimitive(newRdo)) this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemKey: elementKey, sourceNodeItemKey: elementKey });

      // Publish
      this.eventEmitter.publish('nodeChange', {
        changeType: 'add',
        sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath,
        sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath,
        index: index,
        sourceKey: elementKey,
        rdoKey: elementKey,
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
    elementKey,
    lastRdo,
    newSourceElement,
    previousSourceElement,
  }: {
    index: number;
    elementKey: K;
    lastRdo: any;
    newSourceElement: S;
    replaceHandler: NodeReplaceHandler<K>;
    previousSourceElement: S;
  }) {
    let changed = false;

    // ---------------------------
    // REPLACE
    // ---------------------------
    // If non-equal primitive with same indexes, just do a replace operation
    if (NodeTypeUtils.isPrimitive(newSourceElement)) {
      const nextRdo = this.makeRdoElement(newSourceElement);
      replaceHandler({ index, key: elementKey, lastRdo, nextRdo });

      // Publish
      this.eventEmitter.publish('nodeChange', {
        changeType: 'replace',
        sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath,
        sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath,
        index,
        sourceKey: elementKey,
        rdoKey: elementKey,
        previousSourceValue: previousSourceElement,
        newSourceValue: newSourceElement,
      });

      return { changed: true, nextRdo };
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
        sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath,
        index,
        sourceKey: elementKey,
        rdoKey: elementKey,
        previousSourceValue: previousSourceElement,
        newSourceValue: newSourceElement,
      });

      return { changed, nextRdo: this.getRdoNodeItem(elementKey) };
    }
  }

  /** */
  protected handleDeleteElement({ deleteHandler, index, elementKey, rdoToDelete, previousSourceElement }: { index?: number; elementKey: K; rdoToDelete: any; previousSourceElement: S; deleteHandler: NodeDeleteHandler<K> }) {
    const changed = deleteHandler({ index, key: elementKey, lastRdo: rdoToDelete });

    // Publish
    this.eventEmitter.publish('nodeChange', {
      changeType: 'delete',
      sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath,
      sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath,
      index: index,
      sourceKey: elementKey,
      rdoKey: elementKey,
      previousSourceValue: previousSourceElement,
      newSourceValue: undefined,
    });

    return changed;
  }

  public abstract elements(): Iterable<D>;
}
