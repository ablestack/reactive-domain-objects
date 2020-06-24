import { RdoCollectionNWBase } from '..';
import { IGlobalNodeOptions, INodeSyncOptions, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo, IRdoInternalNodeWrapper, IEqualityComparer, CollectionNodePatchOperation } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { NodeChange } from '../../types/event-types';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
export declare class RdoSetNW<K extends string | number, S, D> extends RdoCollectionNWBase<K, S, D> {
    private _value;
    constructor({ value, typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, defaultEqualityComparer, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }: {
        value: Set<D>;
        typeInfo: NodeTypeInfo;
        key: K | undefined;
        mutableNodeCache: MutableNodeCache;
        wrappedParentRdoNode: IRdoInternalNodeWrapper<K, S, D> | undefined;
        wrappedSourceNode: ISourceNodeWrapper<K, S, D>;
        syncChildNode: ISyncChildNode;
        defaultEqualityComparer: IEqualityComparer;
        matchingNodeOptions: INodeSyncOptions<K, S, D> | undefined;
        globalNodeOptions: IGlobalNodeOptions | undefined;
        targetedOptionMatchersArray: Array<INodeSyncOptions<any, any, any>>;
        eventEmitter: EventEmitter<NodeChange>;
    });
    get leafNode(): boolean;
    get value(): Set<D>;
    elements(): Iterable<D>;
    childElementCount(): number;
    executePatchOperations(patchOperations: CollectionNodePatchOperation<K, D>[]): void;
}
