import { IEqualityComparer, IGlobalNodeOptions, INodeSyncOptions, IRdoInternalNodeWrapper, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { NodeChange } from '../../types/event-types';
import { RdoIndexCollectionNWBase } from '../base/rdo-index-collection-nw-base';
export declare class RdoArrayNW<S, D> extends RdoIndexCollectionNWBase<S, D> {
    private _value;
    constructor({ value, typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }: {
        value: Array<D>;
        typeInfo: NodeTypeInfo;
        key: number | undefined;
        mutableNodeCache: MutableNodeCache;
        wrappedParentRdoNode: IRdoInternalNodeWrapper<number, S, D> | undefined;
        wrappedSourceNode: ISourceNodeWrapper<number, S, D>;
        defaultEqualityComparer: IEqualityComparer;
        syncChildNode: ISyncChildNode;
        matchingNodeOptions: INodeSyncOptions<number, S, D> | undefined;
        globalNodeOptions: IGlobalNodeOptions | undefined;
        targetedOptionMatchersArray: Array<INodeSyncOptions<any, any, any>>;
        eventEmitter: EventEmitter<NodeChange>;
    });
    get isLeafNode(): boolean;
    get value(): D[];
    elements(): Iterable<D>;
    childElementCount(): number;
    protected onNewIndex: ({ index, key, nextRdo }: {
        index?: number | undefined;
        key: number;
        nextRdo: any;
    }) => boolean;
    protected onReplaceIndex: ({ index, key, lastRdo, nextRdo }: {
        index?: number | undefined;
        key: number;
        lastRdo: any;
        nextRdo: any;
    }) => boolean;
    protected onDeleteIndex: ({ index, key, lastRdo }: {
        index?: number | undefined;
        key: number;
        lastRdo: any;
    }) => boolean;
}
