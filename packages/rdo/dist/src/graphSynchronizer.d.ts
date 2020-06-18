import { IGraphSynchronizer, IGraphSyncOptions, IRdoInternalNodeWrapper, IWrapRdoNode } from '.';
import { SubscriptionFunction } from './infrastructure';
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
    wrapRdoNode: IWrapRdoNode;
    /**
     *
     */
    syncChildNode: ({ wrappedParentRdoNode, rdoNodeItemValue, rdoNodeItemKey, sourceNodeItemKey, }: {
        wrappedParentRdoNode: IRdoInternalNodeWrapper<any, any>;
        rdoNodeItemValue: object | undefined;
        rdoNodeItemKey: string;
        sourceNodeItemKey: string;
    }) => boolean;
}
