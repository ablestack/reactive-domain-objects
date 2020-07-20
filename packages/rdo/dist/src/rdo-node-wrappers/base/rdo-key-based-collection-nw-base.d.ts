import { IGlobalNodeOptions, INodeSyncOptions, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { IEqualityComparer, IRdoInternalNodeWrapper, NodeReplaceHandler, NodeAddHandler, NodeDeleteHandler } from '../../types';
import { NodeChange } from '../../types/event-types';
import { RdoCollectionNWBase } from './rdo-collection-nw-base';
export declare type RdoKeyCollectionNWBaseViews<S, D> = {
    sourceArray: Array<S>;
    sourceByKeyMap: Map<string | number, S>;
    rdoByKeyMap: Map<string | number, D>;
};
export declare abstract class RdoKeyCollectionNWBase<S, D> extends RdoCollectionNWBase<S, D> {
    constructor({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }: {
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
    });
    protected get views(): RdoKeyCollectionNWBaseViews<S, D>;
    /** */
    smartSync(): boolean;
    getSourceNodeKeys(): IterableIterator<string | number>;
    getSourceNodeItem(key: string | number): S | undefined;
    getRdoNodeItem(key: string | number): D | undefined;
    /** */
    protected abstract onNewKey: NodeAddHandler;
    protected abstract onReplaceKey: NodeReplaceHandler;
    protected abstract onDeleteKey: NodeDeleteHandler;
}
