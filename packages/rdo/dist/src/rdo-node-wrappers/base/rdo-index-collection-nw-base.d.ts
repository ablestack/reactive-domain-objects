import { IGlobalNodeOptions, INodeSyncOptions, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { IEqualityComparer, IRdoInternalNodeWrapper, NodeAddHandler, NodeDeleteHandler, NodeReplaceHandler } from '../../types';
import { NodeChange } from '../../types/event-types';
import { RdoCollectionNWBase } from './rdo-collection-nw-base';
export declare type RdoIndexCollectionNWBaseLastData<K, S, D> = {
    sourceArray: Array<S>;
    keyByIndexMap: Map<number, K>;
    rdoByIndexMap: Map<number, D>;
    indexByKeyMap: Map<K, number>;
};
export declare abstract class RdoIndexCollectionNWBase<K extends string | number, S, D> extends RdoCollectionNWBase<K, S, D> {
    constructor({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }: {
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
    });
    protected get last(): RdoIndexCollectionNWBaseLastData<K, S, D>;
    smartSync(): boolean;
    getSourceNodeKeys(): IterableIterator<K>;
    getSourceNodeItem(key: K): S | undefined;
    /** */
    protected abstract onNewIndex: NodeAddHandler<K>;
    protected abstract onReplaceIndex: NodeReplaceHandler<K>;
    protected abstract onDeleteIndex: NodeDeleteHandler<K>;
}
