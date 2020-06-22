import { IGraphSynchronizer, IGraphSyncOptions, IRdoInternalNodeWrapper, IRdoNodeWrapper, RdoNodeTypes, ISyncChildNode } from '.';
import { NodeChange } from './types/event-types';
import { SubscriptionFunction } from './infrastructure/event-emitter';
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
    private _sourceObjectMap;
    private _sourceNodeInstancePathStack;
    private _sourceNodePathStack;
    private _sourceNodeWrapperFactory;
    private _rdoNodeWrapperFactory;
    private pushSourceNodeInstancePathOntoStack;
    private popSourceNodeInstancePathFromStack;
    private _sourceNodeInstancePath;
    private getSourceNodeInstancePath;
    private _sourceNodePath;
    private getSourceNodePath;
    private setLastSourceNodeInstancePathValue;
    private getLastSourceNodeInstancePathValue;
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
     *
     * @memberof GraphSynchronizer
     * @description clears the previously tracked data
     */
    clearTrackedData(): void;
    /**
     *
     */
    wrapRdoNode: <K extends string | number, S, D>({ sourceNodePath, sourceNode, sourceNodeItemKey, rdoNode, rdoNodeItemKey, wrappedParentRdoNode, }: {
        sourceNodePath: string;
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
