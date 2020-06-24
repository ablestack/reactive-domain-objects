import { RdoCollectionNWBase } from '..';
import { IGlobalNodeOptions, INodeSyncOptions, IRdoInternalNodeWrapper, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo, CollectionNodePatchOperation, IEqualityComparer } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { NodeChange } from '../../types/event-types';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
export declare class RdoArrayNW<S, D> extends RdoCollectionNWBase<string, S, D> {
    private _value;
    constructor({ value, typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }: {
        value: Array<D>;
        typeInfo: NodeTypeInfo;
        key: string | undefined;
        mutableNodeCache: MutableNodeCache;
        wrappedParentRdoNode: IRdoInternalNodeWrapper<string, S, D> | undefined;
        wrappedSourceNode: ISourceNodeWrapper<string, S, D>;
        defaultEqualityComparer: IEqualityComparer;
        syncChildNode: ISyncChildNode;
        matchingNodeOptions: INodeSyncOptions<string, S, D> | undefined;
        globalNodeOptions: IGlobalNodeOptions | undefined;
        targetedOptionMatchersArray: Array<INodeSyncOptions<any, any, any>>;
        eventEmitter: EventEmitter<NodeChange>;
    });
    get leafNode(): boolean;
    get value(): D[];
    elements(): Iterable<D>;
    childElementCount(): number;
    executePatchOperations(patchOperations: CollectionNodePatchOperation<string, D>[]): void;
}
