import { RdoInternalNWBase } from '..';
import { IGlobalNodeOptions, IEqualityComparer, RdoNodeTypeInfo, ISourceNodeWrapper, ISyncChildNode, IWrapRdoNode } from '../..';
import { INodeSyncOptions, IRdoInternalNodeWrapper } from '../../types';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { NodeChange } from '../../types/event-types';
export declare class RdoObjectNW<S, D extends Record<string, any>> extends RdoInternalNWBase<S, D> {
    private _value;
    private _equalityComparer;
    private _wrapRdoNode;
    constructor({ value, typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, wrapRdoNode, globalNodeOptions, matchingNodeOptions, targetedOptionMatchersArray, eventEmitter, }: {
        value: D | undefined;
        typeInfo: RdoNodeTypeInfo;
        key: string | undefined;
        wrappedParentRdoNode: IRdoInternalNodeWrapper<S, D> | undefined;
        wrappedSourceNode: ISourceNodeWrapper<S>;
        defaultEqualityComparer: IEqualityComparer;
        syncChildNode: ISyncChildNode<S, D>;
        wrapRdoNode: IWrapRdoNode;
        matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
        globalNodeOptions: IGlobalNodeOptions | undefined;
        targetedOptionMatchersArray: Array<INodeSyncOptions<any, any>>;
        eventEmitter: EventEmitter<NodeChange>;
    });
    get value(): D;
    childElementCount(): number;
    smartSync(): boolean;
    itemKeys(): string[];
    getElement(key: string): any;
    updateElement(key: string, value: D | undefined): boolean;
    insertElement(key: string, value: D | undefined): boolean;
    /**
     *
     */
    private sync;
    /**
     *
     */
    getFieldname({ sourceFieldname, sourceFieldVal }: {
        sourceFieldname: string;
        sourceFieldVal: string;
    }): string | undefined;
    /** */
    private makeContinueSmartSyncFunction;
}
