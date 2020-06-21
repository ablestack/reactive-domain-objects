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
        syncChildNode: ISyncChildNode;
        globalNodeOptions: IGlobalNodeOptions | undefined;
        targetedOptionMatchersArray: Array<INodeSyncOptions<any, any, any>>;
        wrapRdoNode: IWrapRdoNode;
        defaultEqualityComparer: IEqualityComparer;
    });
    make<K extends string | number | symbol, S, D>({ value, key, wrappedParentRdoNode, wrappedSourceNode, matchingNodeOptions, }: {
        value: RdoNodeTypes<K, S, D> | undefined;
        key: K | undefined;
        wrappedParentRdoNode: IRdoInternalNodeWrapper<any, any, any> | undefined;
        wrappedSourceNode: ISourceNodeWrapper<K, S, D>;
        matchingNodeOptions?: INodeSyncOptions<any, any, any> | undefined;
    }): IRdoNodeWrapper<K, S, D>;
}
