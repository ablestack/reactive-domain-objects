import { RdoNWBase } from './rdo-nw-base';
import { IRdoInternalNodeWrapper, ISyncChildNode, NodeTypeInfo, ISourceNodeWrapper, INodeSyncOptions, IGlobalNodeOptions } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { NodeChange } from '../../types/event-types';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
export declare abstract class RdoInternalNWBase<K extends string | number, S, D> extends RdoNWBase<K, S, D> implements IRdoInternalNodeWrapper<K, S, D> {
    private _syncChildNode;
    constructor({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }: {
        typeInfo: NodeTypeInfo;
        key: K | undefined;
        mutableNodeCache: MutableNodeCache;
        wrappedParentRdoNode: IRdoInternalNodeWrapper<K, S, D> | undefined;
        wrappedSourceNode: ISourceNodeWrapper<K, S, D>;
        syncChildNode: ISyncChildNode;
        matchingNodeOptions: INodeSyncOptions<K, S, D> | undefined;
        globalNodeOptions: IGlobalNodeOptions | undefined;
        targetedOptionMatchersArray: Array<INodeSyncOptions<K, S, D>>;
        eventEmitter: EventEmitter<NodeChange>;
    });
    protected get syncChildNode(): ISyncChildNode;
    makeRdoElement(sourceObject: any): any;
    abstract getItem(key: K): any;
    private autoInstantiateNodeAsMobxObservables;
    private autoInstantiateNodeAsPlainObjectLiterals;
}
