import { RdoCollectionNWBase } from '..';
import { CollectionNodePatchOperation, IEqualityComparer, IGlobalNodeOptions, INodeSyncOptions, IRdoInternalNodeWrapper, ISourceNodeWrapper, ISyncableRDOCollection, ISyncChildNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { NodeChange } from '../../types/event-types';
export declare class RdoSyncableCollectionNW<K extends string | number, S, D> extends RdoCollectionNWBase<K, S, D> {
    private _value;
    constructor({ value, typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, defaultEqualityComparer, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }: {
        value: ISyncableRDOCollection<K, S, D>;
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
    get leafNode(): boolean;
    get value(): ISyncableRDOCollection<K, S, D>;
    elements(): Iterable<D>;
    childElementCount(): number;
    executePatchOperations(patchOperations: CollectionNodePatchOperation<K, D>[]): void;
}
