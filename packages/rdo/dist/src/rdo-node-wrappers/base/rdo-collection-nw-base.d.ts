import { IGlobalNodeOptions, INodeSyncOptions, IRdoCollectionNodeWrapper, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { IRdoInternalNodeWrapper, IEqualityComparer, CollectionNodePatchOperation } from '../../types';
import { NodeChange } from '../../types/event-types';
import { RdoInternalNWBase } from './rdo-internal-nw-base';
export declare abstract class RdoCollectionNWBase<K extends string | number, S, D> extends RdoInternalNWBase<K, S, D> implements IRdoCollectionNodeWrapper<K, S, D> {
    private _equalityComparer;
    constructor({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }: {
        typeInfo: NodeTypeInfo;
        key: K | undefined;
        wrappedParentRdoNode: IRdoInternalNodeWrapper<K, S, D> | undefined;
        wrappedSourceNode: ISourceNodeWrapper<K, S, D>;
        defaultEqualityComparer: IEqualityComparer;
        syncChildNode: ISyncChildNode;
        matchingNodeOptions: INodeSyncOptions<any, any, any> | undefined;
        globalNodeOptions: IGlobalNodeOptions | undefined;
        targetedOptionMatchersArray: Array<INodeSyncOptions<any, any, any>>;
        eventEmitter: EventEmitter<NodeChange>;
    });
    protected preparePatchOperations(): CollectionNodePatchOperation<K, D>[];
    protected synchronizeCollection(): boolean;
    makeCollectionKey: (item: D) => any;
    abstract elements(): Iterable<D>;
    abstract childElementCount(): any;
    abstract clearElements(): any;
    abstract insertItem(key: K, value: D): any;
    abstract deleteElement(key: K): D | undefined;
    abstract executePatchOperations(patchOperations: CollectionNodePatchOperation<K, D>[]): any;
}
