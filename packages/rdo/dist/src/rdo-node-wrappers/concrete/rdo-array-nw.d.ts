import { RdoCollectionNWBase } from '..';
import { IGlobalNodeOptions, INodeSyncOptions, IRdoInternalNodeWrapper, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo, CollectionNodePatchOperation, IEqualityComparer } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { NodeChange } from '../../types/event-types';
export declare class RdoArrayNW<S, D> extends RdoCollectionNWBase<string, S, D> {
    private _value;
    constructor({ value, typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }: {
        value: Array<D>;
        typeInfo: NodeTypeInfo;
        key: string | undefined;
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
    itemKeys(): any[];
    getItem(key: string): D | undefined;
    updateItem(key: string, value: D): boolean;
    insertItem(key: string, value: D): void;
    smartSync(): boolean;
    elements(): Iterable<D>;
    childElementCount(): number;
    deleteElement(key: string): D | undefined;
    clearElements(): boolean;
    executePatchOperations(patchOperations: CollectionNodePatchOperation<string, D>[]): void;
}
