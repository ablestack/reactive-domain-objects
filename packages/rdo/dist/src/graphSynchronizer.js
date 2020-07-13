"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphSynchronizer = void 0;
const _1 = require(".");
const event_emitter_1 = require("./infrastructure/event-emitter");
const logger_1 = require("./infrastructure/logger");
const mutable_node_cache_1 = require("./infrastructure/mutable-node-cache");
const rdo_node_wrapper_factory_1 = require("./rdo-node-wrappers/rdo-node-wrapper-factory");
const node_tracker_1 = require("./infrastructure/node-tracker");
const logger = logger_1.Logger.make('GraphSynchronizer');
/**
 *
 *
 * @export
 * @class GraphSynchronizer
 */
class GraphSynchronizer {
    // ------------------------------------------------------------------------------------------------------------------
    // PRIVATE PROPERTIES
    // ------------------------------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------------------------------
    // CONSTRUCTOR
    // ------------------------------------------------------------------------------------------------------------------
    constructor(options) {
        // ------------------------------------------------------------------------------------------------------------------
        // PRIVATE METHODS
        // ------------------------------------------------------------------------------------------------------------------
        /**
         *
         */
        this.wrapRdoNode = ({ sourceNodeTypePath, sourceNodeInstancePath, sourceNode, sourceNodeItemKey, rdoNode, rdoNodeItemKey, wrappedParentRdoNode, }) => {
            const matchingNodeOptions = this._targetedOptionNodePathsMap.get(sourceNodeTypePath);
            const wrappedSourceNode = this._sourceNodeWrapperFactory.make({ sourceNodeTypePath, sourceNodeInstancePath, value: sourceNode, key: sourceNodeItemKey, matchingNodeOptions });
            const wrappedRdoNode = this._rdoNodeWrapperFactory.make({ value: rdoNode, key: rdoNodeItemKey, mutableNodeCache: this._mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, matchingNodeOptions });
            return wrappedRdoNode;
        };
        /**
         *
         */
        this.syncChildNode = ({ wrappedParentRdoNode, rdoNodeItemKey, sourceNodeItemKey }) => {
            logger.trace(`stepIntoChildNodeAndSync (${rdoNodeItemKey}) - enter`);
            let changed = false;
            //const parentSourceNode = wrappedParentRdoNode.wrappedSourceNode;
            // SETUP AND VALIDATION
            // Node Type
            //if (!isISourceInternalNodeWrapper(parentSourceNode)) throw new Error(`(${this._nodeTracker.getSourceNodeInstancePath()}) Can not step into node. Expected Internal Node but found Leaf Node`);
            // RdoNode
            const rdoNodeItemValue = wrappedParentRdoNode.getItem(rdoNodeItemKey);
            if (rdoNodeItemValue === undefined) {
                logger.trace(`rdoNodeItemValue was null, for key: ${rdoNodeItemKey} in path ${this._nodeTracker.getSourceNodeInstancePath()}. Skipping`);
                return false;
            }
            // SourceNode
            const sourceNode = wrappedParentRdoNode.getSourceNodeItem(sourceNodeItemKey);
            if (sourceNode === undefined) {
                logger.trace(`Could not find child sourceNode with key ${sourceNodeItemKey} in path ${this._nodeTracker.getSourceNodeInstancePath()}. Skipping`, wrappedParentRdoNode.wrappedSourceNode);
                return false;
            }
            // Node traversal tracking - step-in
            this._nodeTracker.pushSourceNodeInstancePathOntoStack(sourceNodeItemKey, wrappedParentRdoNode.wrappedSourceNode.typeInfo.kind);
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
            }
            else {
                logger.trace(`running smartSync on (${this._nodeTracker.getSourceNodePath()})`);
                changed = wrappedRdoNode.smartSync();
            }
            // Node traversal tracking - step-out
            this._nodeTracker.popSourceNodeInstancePathFromStack(wrappedParentRdoNode.wrappedSourceNode.typeInfo.kind);
            return changed;
        };
        this._eventEmitter = new event_emitter_1.EventEmitter();
        this._defaultEqualityComparer = (options === null || options === void 0 ? void 0 : options.customEqualityComparer) || _1.comparers.apollo;
        this._globalNodeOptions = options === null || options === void 0 ? void 0 : options.globalNodeOptions;
        this._targetedOptionNodePathsMap = new Map();
        this._targetedOptionMatchersArray = new Array();
        this._mutableNodeCache = new mutable_node_cache_1.MutableNodeCache();
        this._nodeTracker = new node_tracker_1.NodeTracker();
        if (options === null || options === void 0 ? void 0 : options.targetedNodeOptions) {
            options === null || options === void 0 ? void 0 : options.targetedNodeOptions.forEach((targetedNodeOptionsItem) => {
                if (targetedNodeOptionsItem.sourceNodeMatcher.nodePath)
                    this._targetedOptionNodePathsMap.set(targetedNodeOptionsItem.sourceNodeMatcher.nodePath, targetedNodeOptionsItem);
                this._targetedOptionMatchersArray.push(targetedNodeOptionsItem);
            });
        }
        this._sourceNodeWrapperFactory = new _1.SourceNodeWrapperFactory({ globalNodeOptions: this._globalNodeOptions });
        this._rdoNodeWrapperFactory = new rdo_node_wrapper_factory_1.RdoNodeWrapperFactory({
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
    smartSync({ rootSourceNode, rootRdo }) {
        if (!rootSourceNode || !rootRdo) {
            logger.warn('smartSync - sourceObject or RDO was null. Exiting', { rootSourceNode, rootRdo });
            return;
        }
        logger.trace('smartSync - sync traversal of object tree starting at root', { rootSourceNode, rootRdo });
        const wrappedRdoNode = this.wrapRdoNode({ sourceNodeTypePath: '', sourceNodeInstancePath: '', rdoNode: rootRdo, sourceNode: rootSourceNode });
        wrappedRdoNode.smartSync();
        logger.trace('smartSync - object tree sync traversal completed', { rootSourceNode, rootRdo });
    }
    subscribeToNodeChanges(func) {
        this._eventEmitter.subscribe('nodeChange', func);
    }
    unsubscribeToNodeChanges(func) {
        this._eventEmitter.unsubscribe('nodeChange', func);
    }
}
exports.GraphSynchronizer = GraphSynchronizer;
//# sourceMappingURL=graphSynchronizer.js.map