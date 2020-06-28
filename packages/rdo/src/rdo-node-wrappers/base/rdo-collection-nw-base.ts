import { IGlobalNodeOptions, INodeSyncOptions, IRdoCollectionNodeWrapper, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo, NodeTypeUtils } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { Logger } from '../../infrastructure/logger';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { IEqualityComparer, IRdoInternalNodeWrapper, ISourceCollectionNodeWrapper, NodeChangeHandler } from '../../types';
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
  protected handleAddElement({ index, elementKey, newRdo, newSourceElement, addHandler }: { index: number; elementKey: K; newRdo: any; newSourceElement: S; addHandler: NodeChangeHandler<K> }) {
    const changed = addHandler({ index, key: elementKey, rdo: newRdo });

    if (changed) {
      // If not primitive, sync so child nodes are hydrated
      if (NodeTypeUtils.isPrimitive(newRdo)) this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemKey: elementKey, sourceNodeItemKey: elementKey });

      // Publish
      this.eventEmitter.publish('nodeChange', {
        changeType: 'add',
        sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath,
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
  protected handleReplaceOrUpdate({ replaceHandler, index, elementKey, newRdo, newSourceElement, previousSourceElement }: { index: number; elementKey: K; newRdo: any; newSourceElement: S; replaceHandler: NodeChangeHandler<K>; previousSourceElement: S }) {
    let changed = false;
    if (NodeTypeUtils.isPrimitive(newSourceElement)) {
      replaceHandler({ index, key: elementKey, rdo: newRdo });

      // Publish
      this.eventEmitter.publish('nodeChange', {
        changeType: 'replace',
        sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath,
        index,
        sourceKey: elementKey,
        rdoKey: elementKey,
        previousSourceValue: previousSourceElement,
        newSourceValue: newSourceElement,
      });

      changed = true;
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
        index,
        sourceKey: elementKey,
        rdoKey: elementKey,
        previousSourceValue: previousSourceElement,
        newSourceValue: newSourceElement,
      });
    }
  }

  /** */
  protected handleDeleteElement({ deleteHandler, index, elementKey, rdoToDelete, previousSourceElement }: { index: number; elementKey: K; rdoToDelete: any; previousSourceElement: S; deleteHandler: NodeChangeHandler<K> }) {
    const changed = deleteHandler({ index, key: elementKey, rdo: rdoToDelete });

    // Publish
    this.eventEmitter.publish('nodeChange', {
      changeType: 'delete',
      sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath,
      index: index,
      sourceKey: elementKey,
      rdoKey: elementKey,
      previousSourceValue: previousSourceElement,
      newSourceValue: undefined,
    });

    return changed;
  }

  public abstract elements(): Iterable<D>;
  public abstract getItem(key: K): D | null | undefined;
}
