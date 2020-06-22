import { RdoCollectionNWBase } from '..';
import { IGlobalNodeOptions, INodeSyncOptions, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo, IRdoInternalNodeWrapper } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { NodeChange } from '../../types/event-types';
export declare class RdoSetNW<K extends string | number | symbol, S, D> extends RdoCollectionNWBase<K, S, D> {
    private _value;
    constructor({ value, typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }: {
        value: Set<D>;
        typeInfo: NodeTypeInfo;
        key: K | undefined;
        wrappedParentRdoNode: IRdoInternalNodeWrapper<K, S, D> | undefined;
        wrappedSourceNode: ISourceNodeWrapper<K, S, D>;
        syncChildNode: ISyncChildNode;
        matchingNodeOptions: INodeSyncOptions<K, S, D> | undefined;
        globalNodeOptions: IGlobalNodeOptions | undefined;
        targetedOptionMatchersArray: Array<INodeSyncOptions<any, any, any>>;
        eventEmitter: EventEmitter<NodeChange>;
    });
    get leafNode(): boolean;
    get value(): Set<D>;
    itemKeys(): any[];
    getItem(key: K): D | undefined;
    updateItem(key: K, value: D): boolean;
    smartSync(): boolean;
    elements(): Iterable<D>;
    childElementCount(): number;
    insertItem(key: K, value: D): void;
    deleteElement(key: K): D | undefined;
    clearElements(): boolean;
}
