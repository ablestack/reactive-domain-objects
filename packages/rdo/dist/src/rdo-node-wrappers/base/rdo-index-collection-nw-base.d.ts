import { IGlobalNodeOptions, INodeSyncOptions, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { IEqualityComparer, IRdoInternalNodeWrapper, NodeAddHandler, NodeDeleteHandler, NodeReplaceHandler } from '../../types';
import { NodeChange } from '../../types/event-types';
import { RdoCollectionNWBase } from './rdo-collection-nw-base';
export declare type RdoIndexCollectionNWBaseViews<S, D> = {
    sourceArray: Array<S>;
    keyByIndexMap: Map<number, string | number>;
    rdoByIndexMap: Map<number, D>;
};
export declare abstract class RdoIndexCollectionNWBase<S, D> extends RdoCollectionNWBase<S, D> {
    constructor({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }: {
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
    });
    protected get views(): RdoIndexCollectionNWBaseViews<S, D>;
    smartSync(): boolean;
    getSourceNodeKeys(): IterableIterator<number>;
    getSourceNodeItem(key: number): S;
    getRdoNodeItem(key: number): D | undefined;
    /** */
    protected abstract onNewIndex: NodeAddHandler;
    protected abstract onReplaceIndex: NodeReplaceHandler;
    protected abstract onDeleteIndex: NodeDeleteHandler;
}
