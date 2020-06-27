import {
  comparers,
  IEqualityComparer,
  IGlobalNodeOptions,
  IGraphSynchronizer,
  IGraphSyncOptions,
  INodeSyncOptions,
  InternalNodeKind,
  IRdoInternalNodeWrapper,
  IRdoNodeWrapper,
  isISourceInternalNodeWrapper,
  ISyncChildNode,
  RdoNodeTypes,
  SourceNodeWrapperFactory,
} from '.';
import { EventEmitter, SubscriptionFunction } from './infrastructure/event-emitter';
import { Logger } from './infrastructure/logger';
import { MutableNodeCache } from './infrastructure/mutable-node-cache';
import { RdoNodeWrapperFactory } from './rdo-node-wrappers/rdo-node-wrapper-factory';
import { NodeChange } from './types/event-types';
import { NodeTracker } from './infrastructure/node-tracker';

const logger = Logger.make('GraphSynchronizer');

/**
 *
 *
 * @export
 * @class GraphSynchronizer
 */
export class GraphSynchronizer implements IGraphSynchronizer {
  // ------------------------------------------------------------------------------------------------------------------
  // INTERNAL STATE
  // ------------------------------------------------------------------------------------------------------------------
  private _eventEmitter: EventEmitter<NodeChange>;
  private _defaultEqualityComparer: IEqualityComparer;
  private _globalNodeOptions: IGlobalNodeOptions | undefined;
  private _targetedOptionNodePathsMap: Map<string, INodeSyncOptions<any, any, any>>;
  private _targetedOptionMatchersArray: Array<INodeSyncOptions<any, any, any>>;
  private _mutableNodeCache: MutableNodeCache;
  private _nodeTracker: NodeTracker;
  private _sourceNodeWrapperFactory: SourceNodeWrapperFactory;
  private _rdoNodeWrapperFactory: RdoNodeWrapperFactory;

  // ------------------------------------------------------------------------------------------------------------------
  // PRIVATE PROPERTIES
  // ------------------------------------------------------------------------------------------------------------------

  // ------------------------------------------------------------------------------------------------------------------
  // CONSTRUCTOR
  // ------------------------------------------------------------------------------------------------------------------
  constructor(options?: IGraphSyncOptions) {
    this._eventEmitter = new EventEmitter<NodeChange>();
    this._defaultEqualityComparer = options?.customEqualityComparer || comparers.apollo;
    this._globalNodeOptions = options?.globalNodeOptions;
    this._targetedOptionNodePathsMap = new Map<string, INodeSyncOptions<any, any, any>>();
    this._targetedOptionMatchersArray = new Array<INodeSyncOptions<any, any, any>>();
    this._mutableNodeCache = new MutableNodeCache();
    this._nodeTracker = new NodeTracker();

    if (options?.targetedNodeOptions) {
      options?.targetedNodeOptions.forEach((targetedNodeOptionsItem) => {
        if (targetedNodeOptionsItem.sourceNodeMatcher.nodePath) this._targetedOptionNodePathsMap.set(targetedNodeOptionsItem.sourceNodeMatcher.nodePath, targetedNodeOptionsItem);
        this._targetedOptionMatchersArray.push(targetedNodeOptionsItem);
      });
    }

    this._sourceNodeWrapperFactory = new SourceNodeWrapperFactory({ globalNodeOptions: this._globalNodeOptions });
    this._rdoNodeWrapperFactory = new RdoNodeWrapperFactory({
      eventEmitter: this._eventEmitter,
      syncChildNode: this.syncChildNode,
      globalNodeOptions: this._globalNodeOptions,
      wrapRdoNode: this.wrapRdoNode,
      defaultEqualityComparer: this._defaultEqualityComparer,
      targetedOptionMatchersArray: this._targetedOptionMatchersArray,
    });
  }

  // ------------------------------------------------------------------------------------------------------------------
  // PUBLIC METHODS
  // ------------------------------------------------------------------------------------------------------------------

  /**
   *
   */
  public smartSync<S extends Record<string, any>, D extends Record<string, any>>({ rootSourceNode, rootRdo }: { rootSourceNode: S; rootRdo: D }) {
    if (!rootSourceNode || !rootRdo) {
      logger.warn('smartSync - sourceObject or RDO was null. Exiting', { rootSourceNode, rootRdo });
      return;
    }

    logger.trace('smartSync - sync traversal of object tree starting at root', { rootSourceNode, rootRdo });

    const wrappedRdoNode = this.wrapRdoNode({ sourceNodeTypePath: '', sourceNodeInstancePath: '', rdoNode: rootRdo, sourceNode: rootSourceNode });
    wrappedRdoNode.smartSync();

    logger.trace('smartSync - object tree sync traversal completed', { rootSourceNode, rootRdo });
  }

  public subscribeToNodeChanges(func: SubscriptionFunction<NodeChange>) {
    this._eventEmitter.subscribe('nodeChange', func);
  }

  public unsubscribeToNodeChanges(func: SubscriptionFunction<NodeChange>) {
    this._eventEmitter.unsubscribe('nodeChange', func);
  }

  // ------------------------------------------------------------------------------------------------------------------
  // PRIVATE METHODS
  // ------------------------------------------------------------------------------------------------------------------

  /**
   *
   */
  public wrapRdoNode = <K extends string | number, S, D>({
    sourceNodeTypePath,
    sourceNodeInstancePath,
    sourceNode,
    sourceNodeItemKey,
    rdoNode,
    rdoNodeItemKey,
    wrappedParentRdoNode,
  }: {
    sourceNodeTypePath: string;
    sourceNodeInstancePath: string;
    rdoNode: RdoNodeTypes<K, S, D> | undefined;
    sourceNode: S;
    wrappedParentRdoNode?: IRdoInternalNodeWrapper<any, any, any> | undefined;
    rdoNodeItemKey?: K | undefined;
    sourceNodeItemKey?: K | undefined;
  }): IRdoNodeWrapper<K, S, D> => {
    const matchingNodeOptions = this._targetedOptionNodePathsMap.get(sourceNodeTypePath);

    const wrappedSourceNode = this._sourceNodeWrapperFactory.make<K, S, D>({ sourceNodeTypePath, sourceNodeInstancePath, value: sourceNode, key: sourceNodeItemKey, matchingNodeOptions });
    const wrappedRdoNode = this._rdoNodeWrapperFactory.make<K, S, D>({ value: rdoNode, key: rdoNodeItemKey, mutableNodeCache: this._mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, matchingNodeOptions });

    return wrappedRdoNode;
  };

  /**
   *
   */
  public syncChildNode: ISyncChildNode = ({ wrappedParentRdoNode, rdoNodeItemKey, sourceNodeItemKey }) => {
    logger.trace(`stepIntoChildNodeAndSync (${rdoNodeItemKey}) - enter`);
    let changed = false;
    const parentSourceNode = wrappedParentRdoNode.wrappedSourceNode;

    // SETUP AND VALIDATION
    // Node Type
    if (!isISourceInternalNodeWrapper(parentSourceNode)) throw new Error(`(${this._nodeTracker.getSourceNodeInstancePath()}) Can not step into node. Expected Internal Node but found Leaf Node`);

    // RdoNode
    const rdoNodeItemValue = wrappedParentRdoNode.getItem(rdoNodeItemKey);
    if (rdoNodeItemValue === undefined) {
      logger.trace(`rdoNodeItemValue was null, for key: ${rdoNodeItemKey} in path ${this._nodeTracker.getSourceNodeInstancePath()}. Skipping`);
      return false;
    }

    // SourceNode
    const sourceNode = parentSourceNode.getItem(sourceNodeItemKey);
    if (sourceNode === undefined) {
      logger.trace(`Could not find child sourceNode with key ${sourceNodeItemKey} in path ${this._nodeTracker.getSourceNodeInstancePath()}. Skipping`, parentSourceNode);
      return false;
    }

    // Node traversal tracking - step-in
    this._nodeTracker.pushSourceNodeInstancePathOntoStack(sourceNodeItemKey, parentSourceNode.typeInfo.kind as InternalNodeKind);

    // Wrap Node
    const wrappedRdoNode = this.wrapRdoNode({
      sourceNodeTypePath: this._nodeTracker.getSourceNodePath(),
      sourceNodeInstancePath: this._nodeTracker.getSourceNodeInstancePath(),
      sourceNode,
      rdoNode: rdoNodeItemValue,
      wrappedParentRdoNode: wrappedParentRdoNode,
      rdoNodeItemKey,
      sourceNodeItemKey,
    });

    // Test to see if node should be ignored, if not, synchronize
    if (wrappedRdoNode.ignore) {
      logger.trace(`stepIntoChildNodeAndSync (${rdoNodeItemKey}) - ignore node`);
      changed = false;
    } else {
      logger.trace(`running smartSync on (${this._nodeTracker.getSourceNodePath()})`);
      changed = wrappedRdoNode.smartSync();
    }

    // Node traversal tracking - step-out

    this._nodeTracker.popSourceNodeInstancePathFromStack(parentSourceNode.typeInfo.kind as InternalNodeKind);

    return changed;
  };
}
