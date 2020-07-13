import { IGlobalNodeOptions, INodeSyncOptions, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { IEqualityComparer, IRdoInternalNodeWrapper, NodeReplaceHandler, NodeAddHandler, NodeDeleteHandler } from '../../types';
import { NodeChange } from '../../types/event-types';
import { RdoCollectionNWBase } from './rdo-collection-nw-base';
export declare type RdoKeyCollectionNWBaseLastData<K, S, D> = {
    sourceArray: Array<S>;
    sourceByKeyMap: Map<K, S>;
    rdoByKeyMap: Map<K, D>;
};
export declare abstract class RdoKeyCollectionNWBase<K extends string | number, S, D> extends RdoCollectionNWBase<K, S, D> {
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
    protected get last(): RdoKeyCollectionNWBaseLastData<K, S, D>;
    /** */
    smartSync(): boolean;
    getSourceNodeKeys(): IterableIterator<K>;
    getSourceNodeItem(key: K): S | undefined;
    /** */
    protected abstract onNewKey: NodeAddHandler<K>;
    protected abstract onReplaceKey: NodeReplaceHandler<K>;
    protected abstract onDeleteKey: NodeDeleteHandler<K>;
}
