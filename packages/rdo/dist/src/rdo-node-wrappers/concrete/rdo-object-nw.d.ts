/// <reference types="node" />
import { RdoInternalNWBase } from '..';
import { IEqualityComparer, IGlobalNodeOptions, ISourceNodeWrapper, ISyncChildNode, IWrapRdoNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { INodeSyncOptions, IRdoInternalNodeWrapper } from '../../types';
import { NodeChange } from '../../types/event-types';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
declare type MutableCachedNodeItemType<S> = {
    sourceData: S | null | undefined;
};
export declare class RdoObjectNW<S, D extends Record<string, any>> extends RdoInternalNWBase<S, D> {
    private _value;
    private _equalityComparer;
    private _wrapRdoNode;
    constructor({ value, typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, wrapRdoNode, globalNodeOptions, matchingNodeOptions, targetedOptionMatchersArray, eventEmitter, }: {
        value: D;
        typeInfo: NodeTypeInfo;
        key: string | number | undefined;
        mutableNodeCache: MutableNodeCache;
        wrappedParentRdoNode: IRdoInternalNodeWrapper<S, D> | undefined;
        wrappedSourceNode: ISourceNodeWrapper<S, D>;
        defaultEqualityComparer: IEqualityComparer;
        syncChildNode: ISyncChildNode;
        wrapRdoNode: IWrapRdoNode;
        matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
        globalNodeOptions: IGlobalNodeOptions | undefined;
        targetedOptionMatchersArray: Array<INodeSyncOptions<any, any>>;
        eventEmitter: EventEmitter<NodeChange>;
    });
    /** */
    getNodeInstanceCache(): MutableCachedNodeItemType<S>;
    get isLeafNode(): boolean;
    get value(): Record<string, any>;
    childElementCount(): number;
    smartSync(): boolean;
    getSourceNodeKeys(): Iterable<import("fs").Mode>;
    getSourceNodeItem(key: string): any;
    getRdoNodeItem(key: string): any;
    /**
     *
     */
    private sync;
    /**
     *
     */
    getFieldname({ sourceFieldname, sourceFieldVal }: {
        sourceFieldname: string;
        sourceFieldVal: any;
    }): string | undefined;
    /** */
    private makeContinueSmartSyncFunction;
    /** */
    private primitiveDirectSync;
}
export {};
