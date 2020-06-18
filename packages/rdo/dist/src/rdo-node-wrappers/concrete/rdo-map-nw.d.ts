import { RdoCollectionNWBase } from '..';
import { IGlobalNodeOptions, INodeSyncOptions, ISourceNodeWrapper, ISyncChildNode, RdoNodeTypeInfo, IRdoInternalNodeWrapper } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { NodeChange } from '../../types/event-types';
export declare class RdoMapNW<S, D> extends RdoCollectionNWBase<S, D> {
    private _value;
    constructor({ value, typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }: {
        value: Map<string, D>;
        typeInfo: RdoNodeTypeInfo;
        key: string | undefined;
        wrappedParentRdoNode: IRdoInternalNodeWrapper<S, D> | undefined;
        wrappedSourceNode: ISourceNodeWrapper<S>;
        syncChildNode: ISyncChildNode<S, D>;
        matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
        globalNodeOptions: IGlobalNodeOptions | undefined;
        targetedOptionMatchersArray: Array<INodeSyncOptions<any, any>>;
        eventEmitter: EventEmitter<NodeChange>;
    });
    get value(): Map<string, D>;
    itemKeys(): IterableIterator<string>;
    getElement(key: string): D | undefined;
    updateElement(key: string, value: D): boolean;
    insertElement(key: string, value: D): void;
    smartSync(): boolean;
    elements(): Iterable<D>;
    childElementCount(): number;
    deleteElement(key: string): boolean;
    clearElements(): boolean;
}
