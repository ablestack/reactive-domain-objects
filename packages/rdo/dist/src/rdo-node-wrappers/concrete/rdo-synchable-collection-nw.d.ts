import { IEqualityComparer, IGlobalNodeOptions, INodeSyncOptions, IRdoInternalNodeWrapper, ISourceNodeWrapper, ISyncableRDOKeyBasedCollection, ISyncChildNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { NodeChange } from '../../types/event-types';
import { RdoKeyCollectionNWBase } from '../base/rdo-key-based-collection-nw-base';
export declare class RdoSyncableCollectionNW<S, D> extends RdoKeyCollectionNWBase<S, D> {
    private _value;
    constructor({ value, typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, defaultEqualityComparer, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }: {
        value: ISyncableRDOKeyBasedCollection<S, D>;
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
    get isLeafNode(): boolean;
    get value(): ISyncableRDOKeyBasedCollection<S, D>;
    elements(): Iterable<D>;
    childElementCount(): number;
    protected onNewKey: ({ index, key, nextRdo }: {
        index?: number | undefined;
        key: string | number;
        nextRdo: any;
    }) => boolean;
    protected onReplaceKey: ({ index, key, lastRdo, nextRdo }: {
        index?: number | undefined;
        key: string | number;
        lastRdo: any;
        nextRdo: any;
    }) => boolean;
    protected onDeleteKey: ({ index, key, lastRdo }: {
        index?: number | undefined;
        key: string | number;
        lastRdo: any;
    }) => boolean;
}
