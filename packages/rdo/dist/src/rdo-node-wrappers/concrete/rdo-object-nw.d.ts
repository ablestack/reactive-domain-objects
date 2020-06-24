import { RdoInternalNWBase } from '..';
import { IEqualityComparer, IGlobalNodeOptions, ISourceNodeWrapper, ISyncChildNode, IWrapRdoNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { INodeSyncOptions, IRdoInternalNodeWrapper } from '../../types';
import { NodeChange } from '../../types/event-types';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
declare type MutableCachedNodeItemType<S> = {
    sourceData: S | null | undefined;
};
export declare class RdoObjectNW<K extends string, S, D extends Record<K, any>> extends RdoInternalNWBase<K, S, D> {
    private _value;
    private _equalityComparer;
    private _wrapRdoNode;
    constructor({ value, typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, wrapRdoNode, globalNodeOptions, matchingNodeOptions, targetedOptionMatchersArray, eventEmitter, }: {
        value: D;
        typeInfo: NodeTypeInfo;
        key: K | undefined;
        mutableNodeCache: MutableNodeCache;
        wrappedParentRdoNode: IRdoInternalNodeWrapper<any, S, D> | undefined;
        wrappedSourceNode: ISourceNodeWrapper<K, S, D>;
        defaultEqualityComparer: IEqualityComparer;
        syncChildNode: ISyncChildNode;
        wrapRdoNode: IWrapRdoNode;
        matchingNodeOptions: INodeSyncOptions<any, any, any> | undefined;
        globalNodeOptions: IGlobalNodeOptions | undefined;
        targetedOptionMatchersArray: Array<INodeSyncOptions<any, any, any>>;
        eventEmitter: EventEmitter<NodeChange>;
    });
    /** */
    getNodeInstanceCache(): MutableCachedNodeItemType<S>;
    get leafNode(): boolean;
    get value(): D;
    childElementCount(): number;
    smartSync(): boolean;
    /**
     *
     */
    private sync;
    /**
     *
     */
    getFieldname({ sourceFieldname, sourceFieldVal }: {
        sourceFieldname: K;
        sourceFieldVal: any;
    }): K | undefined;
    /** */
    private makeContinueSmartSyncFunction;
    /** */
    private primitiveDirectSync;
}
export {};
