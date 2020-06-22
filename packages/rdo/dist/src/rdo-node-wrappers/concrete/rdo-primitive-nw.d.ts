import { RdoNWBase } from '..';
import { IGlobalNodeOptions, INodeSyncOptions, ISourceNodeWrapper, NodeTypeInfo, IRdoInternalNodeWrapper } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { NodeChange } from '../../types/event-types';
export declare class RdoPrimitiveNW<K extends string | number | symbol, S, D> extends RdoNWBase<K, S, D> {
    private _value;
    constructor({ value, typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }: {
        value: D;
        typeInfo: NodeTypeInfo;
        key: K | undefined;
        wrappedParentRdoNode: IRdoInternalNodeWrapper<any, S, D> | undefined;
        wrappedSourceNode: ISourceNodeWrapper<K, S, D>;
        matchingNodeOptions: INodeSyncOptions<any, any, any> | undefined;
        globalNodeOptions: IGlobalNodeOptions | undefined;
        targetedOptionMatchersArray: Array<INodeSyncOptions<any, any, any>>;
        eventEmitter: EventEmitter<NodeChange>;
    });
    get leafNode(): boolean;
    get value(): D | undefined;
    childElementCount(): number;
    smartSync(): boolean;
}
