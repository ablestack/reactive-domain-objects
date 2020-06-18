import { IRdoNodeWrapper, RdoNodeTypeInfo, ISourceNodeWrapper, IGlobalNodeOptions, INodeSyncOptions } from '../..';
import { IRdoInternalNodeWrapper } from '../../types';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { NodeChange } from '../../types/event-types';
export declare abstract class RdoNWBase<S, D> implements IRdoNodeWrapper<S, D> {
    private _typeInfo;
    private _key;
    private _parent;
    private _wrappedSourceNode;
    private _matchingNodeOptions;
    private _globalNodeOptions;
    private _targetedOptionMatchersArray;
    private _eventEmitter;
    constructor({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }: {
        typeInfo: RdoNodeTypeInfo;
        key: string | undefined;
        wrappedParentRdoNode: IRdoInternalNodeWrapper<S, D> | undefined;
        wrappedSourceNode: ISourceNodeWrapper<S>;
        matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
        globalNodeOptions: IGlobalNodeOptions | undefined;
        targetedOptionMatchersArray: Array<INodeSyncOptions<any, any>>;
        eventEmitter: EventEmitter<NodeChange>;
    });
    protected get eventEmitter(): EventEmitter<NodeChange>;
    get ignore(): boolean;
    get key(): string | undefined;
    get wrappedParentRdoNode(): IRdoInternalNodeWrapper<S, D> | undefined;
    get typeInfo(): RdoNodeTypeInfo;
    get wrappedSourceNode(): ISourceNodeWrapper<S>;
    get globalNodeOptions(): IGlobalNodeOptions | undefined;
    private _nodeOptions;
    getNodeOptions(): INodeSyncOptions<any, any> | null;
    abstract get value(): any;
    abstract smartSync(): any;
    abstract childElementCount(): any;
}
