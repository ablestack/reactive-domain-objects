import { RdoNWBase } from './rdo-nw-base';
import { IRdoInternalNodeWrapper, ISyncChildNode, NodeTypeInfo, ISourceNodeWrapper, INodeSyncOptions, IGlobalNodeOptions } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { NodeChange } from '../../types/event-types';
export declare abstract class RdoInternalNWBase<K extends string | number | symbol, S, D> extends RdoNWBase<K, S, D> implements IRdoInternalNodeWrapper<K, S, D> {
    protected _syncChildNode: ISyncChildNode;
    constructor({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }: {
        typeInfo: NodeTypeInfo;
        key: K | undefined;
        wrappedParentRdoNode: IRdoInternalNodeWrapper<K, S, D> | undefined;
        wrappedSourceNode: ISourceNodeWrapper<K, S, D>;
        syncChildNode: ISyncChildNode;
        matchingNodeOptions: INodeSyncOptions<K, S, D> | undefined;
        globalNodeOptions: IGlobalNodeOptions | undefined;
        targetedOptionMatchersArray: Array<INodeSyncOptions<K, S, D>>;
        eventEmitter: EventEmitter<NodeChange>;
    });
    makeRdoElement(sourceObject: any): any;
    abstract itemKeys(): any;
    abstract getItem(key: K): any;
    abstract updateItem(key: K, value: D): any;
    abstract insertItem(key: K, value: D): any;
    private autoInstantiateNodeAsMobxObservables;
    private autoInstantiateNodeAsPlainObjectLiterals;
}
