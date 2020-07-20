import { IGlobalNodeOptions, INodeSyncOptions, IRdoCollectionNodeWrapper, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { IEqualityComparer, IRdoInternalNodeWrapper, NodeReplaceHandler, NodeAddHandler, NodeDeleteHandler } from '../../types';
import { NodeChange } from '../../types/event-types';
import { RdoInternalNWBase } from './rdo-internal-nw-base';
export declare abstract class RdoCollectionNWBase<S, D> extends RdoInternalNWBase<S, D> implements IRdoCollectionNodeWrapper<S, D> {
    private _equalityComparer;
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
    protected get equalityComparer(): IEqualityComparer;
    /** */
    protected handleAddElement({ index, collectionKey, newRdo, newSourceElement, addHandler }: {
        index: number;
        collectionKey: string | number;
        newRdo: any;
        newSourceElement: S;
        addHandler: NodeAddHandler;
    }): boolean;
    /** */
    protected handleReplaceOrUpdate({ replaceHandler, index, collectionKey, lastElementKey, nextElementKey, lastRdo, newSourceElement, previousSourceElement, }: {
        index: number;
        collectionKey: string | number;
        lastElementKey: string | number;
        nextElementKey: string | number;
        lastRdo: any;
        newSourceElement: S;
        replaceHandler: NodeReplaceHandler;
        previousSourceElement: S;
    }): {
        changed: boolean;
        nextRdo: any;
    };
    /** */
    protected handleDeleteElement({ deleteHandler, index, collectionKey, rdoToDelete, previousSourceElement }: {
        index?: number;
        collectionKey: string | number;
        rdoToDelete: any;
        previousSourceElement: S;
        deleteHandler: NodeDeleteHandler;
    }): boolean;
    abstract elements(): Iterable<D>;
}
