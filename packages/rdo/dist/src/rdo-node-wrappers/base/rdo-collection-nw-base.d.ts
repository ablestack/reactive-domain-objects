import { IGlobalNodeOptions, INodeSyncOptions, IRdoCollectionNodeWrapper, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { CollectionNodePatchOperation, IEqualityComparer, IRdoInternalNodeWrapper, ISourceCollectionNodeWrapper } from '../../types';
import { NodeChange } from '../../types/event-types';
import { RdoInternalNWBase } from './rdo-internal-nw-base';
declare type MutableCachedNodeItemType<K, S, D> = {
    sourceData: Array<S>;
    rdoMap: Map<K, D>;
};
export declare abstract class RdoCollectionNWBase<K extends string | number, S, D> extends RdoInternalNWBase<K, S, D> implements IRdoCollectionNodeWrapper<K, S, D> {
    private _equalityComparer;
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
    /** */
    getNodeInstanceCache(): MutableCachedNodeItemType<K, S, D>;
    /** */
    protected generatePatchOperations({ wrappedSourceNode, mutableNodeCacheItem }: {
        wrappedSourceNode: ISourceCollectionNodeWrapper<K, S, D>;
        mutableNodeCacheItem: MutableCachedNodeItemType<K, S, D>;
    }): CollectionNodePatchOperation<K, D>[];
    /** */
    smartSync(): boolean;
    abstract elements(): Iterable<D>;
    abstract executePatchOperations(patchOperations: CollectionNodePatchOperation<K, D>[]): any;
}
export {};
