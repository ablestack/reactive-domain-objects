import { IEqualityComparer, IGlobalNodeOptions, INodeSyncOptions, IRdoNodeWrapper, ISourceNodeWrapper, ISyncChildNode, IWrapRdoNode, RdoNodeTypes, IRdoInternalNodeWrapper } from '..';
import { EventEmitter } from '../infrastructure/event-emitter';
import { NodeChange } from '../types/event-types';
export declare class RdoNodeWrapperFactory {
    private _eventEmitter;
    private _syncChildNode;
    private _globalNodeOptions;
    private _targetedOptionMatchersArray;
    private _wrapRdoNode;
    private _defaultEqualityComparer;
    constructor({ eventEmitter, syncChildNode, globalNodeOptions, targetedOptionMatchersArray, wrapRdoNode, defaultEqualityComparer, }: {
        eventEmitter: EventEmitter<NodeChange>;
        syncChildNode: ISyncChildNode<any, any>;
        globalNodeOptions: IGlobalNodeOptions | undefined;
        targetedOptionMatchersArray: Array<INodeSyncOptions<any, any>>;
        wrapRdoNode: IWrapRdoNode;
        defaultEqualityComparer: IEqualityComparer;
    });
    make<S, D>({ value, key, wrappedParentRdoNode, wrappedSourceNode, matchingNodeOptions, }: {
        value: RdoNodeTypes<S, D> | undefined;
        key: string | undefined;
        wrappedParentRdoNode: IRdoInternalNodeWrapper<S, D> | undefined;
        wrappedSourceNode: ISourceNodeWrapper<S>;
        matchingNodeOptions?: INodeSyncOptions<any, any> | undefined;
    }): IRdoNodeWrapper<S, D>;
}
