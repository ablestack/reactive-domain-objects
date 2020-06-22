import { RdoCollectionNWBase } from '..';
import { IGlobalNodeOptions, INodeSyncOptions, IRdoInternalNodeWrapper, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { NodeChange } from '../../types/event-types';
export declare class RdoArrayNW<K extends string | number | symbol, S, D> extends RdoCollectionNWBase<K, S, D> {
    private _value;
    constructor({ value, typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }: {
        value: Array<D>;
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
    get value(): D[];
    itemKeys(): any[];
    getItem(key: K): D | undefined;
    updateItem(key: K, value: D): boolean;
    insertItem(key: K, value: D): void;
    smartSync(): boolean;
    elements(): Iterable<D>;
    childElementCount(): number;
    deleteElement(key: K): D | undefined;
    clearElements(): boolean;
}
