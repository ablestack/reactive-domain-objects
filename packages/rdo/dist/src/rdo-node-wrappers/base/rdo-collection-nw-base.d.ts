import { IGlobalNodeOptions, INodeSyncOptions, IRdoCollectionNodeWrapper, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { IEqualityComparer, IRdoInternalNodeWrapper, NodeReplaceHandler, NodeAddHandler, NodeDeleteHandler } from '../../types';
import { NodeChange } from '../../types/event-types';
import { RdoInternalNWBase } from './rdo-internal-nw-base';
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
    protected get equalityComparer(): IEqualityComparer;
    /** */
    protected handleAddElement({ index, elementKey, newRdo, newSourceElement, addHandler }: {
        index: number;
        elementKey: K;
        newRdo: any;
        newSourceElement: S;
        addHandler: NodeAddHandler<K>;
    }): boolean;
    /** */
    protected handleReplaceOrUpdate({ replaceHandler, index, elementKey, lastRdo, newSourceElement, previousSourceElement, }: {
        index: number;
        elementKey: K;
        lastRdo: any;
        newSourceElement: S;
        replaceHandler: NodeReplaceHandler<K>;
        previousSourceElement: S;
    }): {
        changed: boolean;
        nextRdo: any;
    };
    /** */
    protected handleDeleteElement({ deleteHandler, index, elementKey, rdoToDelete, previousSourceElement }: {
        index?: number;
        elementKey: K;
        rdoToDelete: any;
        previousSourceElement: S;
        deleteHandler: NodeDeleteHandler<K>;
    }): boolean;
    abstract elements(): Iterable<D>;
    abstract getItem(key: K): D | null | undefined;
}
