import { RdoNWBase } from './rdo-nw-base';
import { IRdoInternalNodeWrapper, ISyncChildNode, NodeTypeInfo, ISourceNodeWrapper, INodeSyncOptions, IGlobalNodeOptions } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { NodeChange } from '../../types/event-types';
export declare abstract class RdoInternalNWBase<S, D> extends RdoNWBase<S, D> implements IRdoInternalNodeWrapper<S, D> {
    protected _syncChildNode: ISyncChildNode<S, D>;
    constructor({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }: {
        typeInfo: NodeTypeInfo;
        key: string | undefined;
        wrappedParentRdoNode: IRdoInternalNodeWrapper<S, D> | undefined;
        wrappedSourceNode: ISourceNodeWrapper<S>;
        syncChildNode: ISyncChildNode<S, D>;
        matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
        globalNodeOptions: IGlobalNodeOptions | undefined;
        targetedOptionMatchersArray: Array<INodeSyncOptions<any, any>>;
        eventEmitter: EventEmitter<NodeChange>;
    });
    makeRdoElement(sourceObject: any): any;
    abstract itemKeys(): any;
    abstract getItem(key: string): any;
    abstract updateItem(key: string, value: D): any;
    abstract insertItem(key: string, value: D): any;
    private autoInstantiateNodeAsMobxObservables;
    private autoInstantiateNodeAsPlainObjectLiterals;
}
