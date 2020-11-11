import { IEqualityComparer, IGlobalNodeOptions, INodeSyncOptions, IRdoNodeWrapper, ISourceNodeWrapper, ISyncChildNode, IWrapRdoNode, RdoNodeTypes, IRdoInternalNodeWrapper } from '..';
import { EventEmitter } from '../infrastructure/event-emitter';
import { NodeChange } from '../types/event-types';
import { MutableNodeCache } from '../infrastructure/mutable-node-cache';
export declare class RdoNodeWrapperFactory {
    private _eventEmitter;
    private _syncChildNode;
    private _globalNodeOptions;
    private _targetedOptionMatchersArray;
    private _wrapRdoNode;
    private _defaultEqualityComparer;
    constructor({ eventEmitter, syncChildNode, globalNodeOptions, targetedOptionMatchersArray, wrapRdoNode, defaultEqualityComparer, }: {
        eventEmitter: EventEmitter<NodeChange>;
        syncChildNode: ISyncChildNode;
        globalNodeOptions: IGlobalNodeOptions | undefined;
        targetedOptionMatchersArray: Array<INodeSyncOptions<any, any>>;
        wrapRdoNode: IWrapRdoNode;
        defaultEqualityComparer: IEqualityComparer;
    });
    make<S, D>({ value, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, matchingNodeOptions, }: {
        value: RdoNodeTypes<S, D> | undefined;
        key: string | number | undefined;
        mutableNodeCache: MutableNodeCache;
        wrappedParentRdoNode: IRdoInternalNodeWrapper<any, any> | undefined;
        wrappedSourceNode: ISourceNodeWrapper<S, D>;
        matchingNodeOptions?: INodeSyncOptions<any, any> | undefined;
    }): IRdoNodeWrapper<S, D>;
}
