import { IGraphSynchronizer, IGraphSyncOptions, IRdoInternalNodeWrapper, IRdoNodeWrapper, ISyncChildNode, RdoNodeTypes } from '.';
import { SubscriptionFunction } from './infrastructure/event-emitter';
import { NodeChange } from './types/event-types';
/**
 *
 *
 * @export
 * @class GraphSynchronizer
 */
export declare class GraphSynchronizer implements IGraphSynchronizer {
    private _eventEmitter;
    private _defaultEqualityComparer;
    private _globalNodeOptions;
    private _targetedOptionNodePathsMap;
    private _targetedOptionMatchersArray;
    private _mutableNodeCache;
    private _nodeTracker;
    private _sourceNodeWrapperFactory;
    private _rdoNodeWrapperFactory;
    constructor(options?: IGraphSyncOptions);
    /**
     *
     */
    smartSync<S extends Record<string, any>, D extends Record<string, any>>({ rootSourceNode, rootRdo }: {
        rootSourceNode: S;
        rootRdo: D;
    }): void;
    subscribeToNodeChanges(func: SubscriptionFunction<NodeChange>): void;
    unsubscribeToNodeChanges(func: SubscriptionFunction<NodeChange>): void;
    /**
     *
     */
    wrapRdoNode: <K extends string | number, S, D>({ sourceNodeTypePath, sourceNodeInstancePath, sourceNode, sourceNodeItemKey, rdoNode, rdoNodeItemKey, wrappedParentRdoNode, }: {
        sourceNodeTypePath: string;
        sourceNodeInstancePath: string;
        rdoNode: RdoNodeTypes<K, S, D>;
        sourceNode: S;
        wrappedParentRdoNode?: IRdoInternalNodeWrapper<any, any, any> | undefined;
        rdoNodeItemKey?: K | undefined;
        sourceNodeItemKey?: K | undefined;
    }) => IRdoNodeWrapper<K, S, D>;
    /**
     *
     */
    syncChildNode: ISyncChildNode;
}
