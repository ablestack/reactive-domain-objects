import { IRdoNodeWrapper, NodeTypeInfo, ISourceNodeWrapper, IGlobalNodeOptions, INodeSyncOptions } from '../..';
import { IRdoInternalNodeWrapper } from '../../types';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { NodeChange } from '../../types/event-types';
export declare abstract class RdoNWBase<K extends string | number, S, D> implements IRdoNodeWrapper<K, S, D> {
    private _typeInfo;
    private _key;
    private _parent;
    private _wrappedSourceNode;
    private _matchingNodeOptions;
    private _globalNodeOptions;
    private _targetedOptionMatchersArray;
    private _eventEmitter;
    constructor({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }: {
        typeInfo: NodeTypeInfo;
        key: K | undefined;
        wrappedParentRdoNode: IRdoInternalNodeWrapper<any, S, D> | undefined;
        wrappedSourceNode: ISourceNodeWrapper<K, S, D>;
        matchingNodeOptions: INodeSyncOptions<K, S, D> | undefined;
        globalNodeOptions: IGlobalNodeOptions | undefined;
        targetedOptionMatchersArray: Array<INodeSyncOptions<K, S, D>>;
        eventEmitter: EventEmitter<NodeChange>;
    });
    protected get eventEmitter(): EventEmitter<NodeChange>;
    get ignore(): boolean;
    get key(): K | undefined;
    get wrappedParentRdoNode(): IRdoInternalNodeWrapper<any, S, D> | undefined;
    get typeInfo(): NodeTypeInfo;
    get wrappedSourceNode(): ISourceNodeWrapper<K, S, D>;
    get globalNodeOptions(): IGlobalNodeOptions | undefined;
    private _nodeOptions;
    getNodeOptions(): INodeSyncOptions<K, S, D> | null;
    abstract get leafNode(): any;
    abstract get value(): any;
    abstract smartSync(): any;
    abstract childElementCount(): any;
}
