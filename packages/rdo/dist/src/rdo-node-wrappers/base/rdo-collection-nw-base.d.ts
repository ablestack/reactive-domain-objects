import { IGlobalNodeOptions, INodeSyncOptions, IRdoCollectionNodeWrapper, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { IRdoInternalNodeWrapper } from '../../types';
import { NodeChange } from '../../types/event-types';
import { RdoInternalNWBase } from './rdo-internal-nw-base';
export declare abstract class RdoCollectionNWBase<K extends string | number | symbol, S, D> extends RdoInternalNWBase<K, S, D> implements IRdoCollectionNodeWrapper<K, S, D> {
    constructor({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }: {
        typeInfo: NodeTypeInfo;
        key: K | undefined;
        wrappedParentRdoNode: IRdoInternalNodeWrapper<K, S, D> | undefined;
        wrappedSourceNode: ISourceNodeWrapper<K, S, D>;
        syncChildNode: ISyncChildNode;
        matchingNodeOptions: INodeSyncOptions<any, any, any> | undefined;
        globalNodeOptions: IGlobalNodeOptions | undefined;
        targetedOptionMatchersArray: Array<INodeSyncOptions<any, any, any>>;
        eventEmitter: EventEmitter<NodeChange>;
    });
    protected synchronizeCollection(): boolean;
    makeCollectionKey: (item: D) => any;
    abstract elements(): Iterable<D>;
    abstract childElementCount(): any;
    abstract clearElements(): any;
    abstract insertItem(key: K, value: D): any;
    abstract deleteElement(key: K): D | undefined;
}
