import { IEqualityComparer, IGlobalNodeOptions, INodeSyncOptions, IRdoInternalNodeWrapper, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { NodeChange } from '../../types/event-types';
import { RdoKeyCollectionNWBase } from '../base/rdo-key-based-collection-nw-base';
export declare class RdoSetNW<K extends string | number, S, D> extends RdoKeyCollectionNWBase<K, S, D> {
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
    get isLeafNode(): boolean;
    get value(): Set<D>;
    elements(): Iterable<D>;
    childElementCount(): number;
    protected onNewKey: ({ index, key, nextRdo }: {
        index?: number | undefined;
        key: K;
        nextRdo: any;
    }) => boolean;
    protected onReplaceKey: ({ index, key, lastRdo, nextRdo }: {
        index?: number | undefined;
        key: K;
        lastRdo: any;
        nextRdo: any;
    }) => boolean;
    protected onDeleteKey: ({ index, key, lastRdo }: {
        index?: number | undefined;
        key: K;
        lastRdo: any;
    }) => boolean;
}
