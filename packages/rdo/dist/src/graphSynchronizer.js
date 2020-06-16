"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphSynchronizer = void 0;
const _1 = require(".");
const logger_1 = require("./infrastructure/logger");
const rdo_node_wrapper_factory_1 = require("./rdo-node-wrappers/rdo-node-wrapper-factory");
const logger = logger_1.Logger.make('GraphSynchronizer');
/**
 *
 *
 * @export
 * @class GraphSynchronizer
 */
class GraphSynchronizer {
    // ------------------------------------------------------------------------------------------------------------------
    // CONSTRUCTOR
    // ------------------------------------------------------------------------------------------------------------------
    constructor(options) {
        this._sourceObjectMap = new Map();
        this._sourceNodeInstancePathStack = new Array();
        this._sourceNodePathStack = new Array();
        // ------------------------------------------------------------------------------------------------------------------
        // PRIVATE METHODS
        // ------------------------------------------------------------------------------------------------------------------
        /**
         *
         */
        this.wrapRdoNode = ({ sourceNodePath, sourceNode, sourceNodeItemKey, rdoNode, rdoNodeItemKey, wrappedParentRdoNode }) => {
            const matchingNodeOptions = this._targetedOptionNodePathsMap.get(sourceNodePath);
            const wrappedSourceNode = this._sourceNodeWrapperFactory.make({ sourceNodePath, value: sourceNode, key: sourceNodeItemKey, lastSourceNode: this.getLastSourceNodeInstancePathValue(), matchingNodeOptions });
            const wrappedRdoNode = this._rdoNodeWrapperFactory.make({ value: rdoNode, key: rdoNodeItemKey, wrappedParentRdoNode, wrappedSourceNode, matchingNodeOptions });
            return wrappedRdoNode;
        };
        /**
         *
         */
        this.syncChildNode = ({ parentRdoNode, rdoNodeItemKey, sourceNodeItemKey }) => {
            logger.trace(`stepIntoChildNodeAndSync (${rdoNodeItemKey}) - enter`);
            let changed = false;
            const parentSourceNode = parentRdoNode.wrappedSourceNode;
            // Validate
            if (!_1.isISourceInternalNodeWrapper(parentSourceNode))
                throw new Error(`(${this.getSourceNodeInstancePath()}) Can not step Node in path. Expected Internal Node but found Leaf Node`);
            const rdoNode = parentRdoNode.getElement(rdoNodeItemKey);
            if (!rdoNode === undefined) {
                logger.trace(`Could not find child rdoNode with key ${rdoNodeItemKey} in path ${this.getSourceNodeInstancePath()}`);
                return false;
            }
            const sourceNode = parentSourceNode.getItem(sourceNodeItemKey);
            if (!sourceNode === undefined) {
                logger.trace(`Could not find child sourceNode with key ${sourceNodeItemKey} in path ${this.getSourceNodeInstancePath()}`);
                return false;
            }
            // Node traversal tracking - step-in
            this.pushSourceNodeInstancePathOntoStack(sourceNodeItemKey, parentSourceNode.typeInfo.kind);
            // Wrap Node
            const wrappedRdoNode = this.wrapRdoNode({ sourceNodePath: this.getSourceNodePath(), sourceNode, rdoNode, wrappedParentRdoNode: parentRdoNode, rdoNodeItemKey, sourceNodeItemKey });
            // Test to see if node should be ignored, if not, synchronize
            if (wrappedRdoNode.ignore) {
                logger.trace(`stepIntoChildNodeAndSync (${rdoNodeItemKey}) - ignore node`);
                return false;
            }
            else {
                changed = wrappedRdoNode.smartSync();
            }
            // Node traversal tracking - step-out
            this.setLastSourceNodeInstancePathValue(parentSourceNode.value);
            this.popSourceNodeInstancePathFromStack(parentSourceNode.typeInfo.kind);
            return changed;
        };
        this._defaultEqualityComparer = (options === null || options === void 0 ? void 0 : options.customEqualityComparer) || _1.comparers.apollo;
        this._globalNodeOptions = options === null || options === void 0 ? void 0 : options.globalNodeOptions;
        this._targetedOptionNodePathsMap = new Map();
        this._targetedOptionMatchersArray = new Array();
        if (options === null || options === void 0 ? void 0 : options.targetedNodeOptions) {
            options === null || options === void 0 ? void 0 : options.targetedNodeOptions.forEach((targetedNodeOptionsItem) => {
                if (targetedNodeOptionsItem.sourceNodeMatcher.nodePath)
                    this._targetedOptionNodePathsMap.set(targetedNodeOptionsItem.sourceNodeMatcher.nodePath, targetedNodeOptionsItem);
                this._targetedOptionMatchersArray.push(targetedNodeOptionsItem);
            });
        }
        this._sourceNodeWrapperFactory = new _1.SourceNodeWrapperFactory({ globalNodeOptions: this._globalNodeOptions });
        this._rdoNodeWrapperFactory = new rdo_node_wrapper_factory_1.RdoNodeWrapperFactory({
            syncChildNode: this.syncChildNode,
            globalNodeOptions: this._globalNodeOptions,
            wrapRdoNode: this.wrapRdoNode,
            defaultEqualityComparer: this._defaultEqualityComparer,
        });
    }
    // ------------------------------------------------------------------------------------------------------------------
    // PRIVATE PROPERTIES
    // ------------------------------------------------------------------------------------------------------------------
    pushSourceNodeInstancePathOntoStack(key, sourceNodeKind) {
        logger.trace(`Adding SourceNode to sourceNodeInstancePathStack: ${this.getSourceNodeInstancePath()} + ${key} (${sourceNodeKind})`);
        this._sourceNodeInstancePathStack.push(key);
        // reset locally cached dependencies
        this._sourceNodeInstancePath = undefined;
        // push to typepath if objectProperty
        if (sourceNodeKind === 'Object') {
            this._sourceNodePathStack.push(key);
            // reset locally cached dependencies
            this._sourceNodePath = undefined;
        }
    }
    popSourceNodeInstancePathFromStack(sourceNodeKind) {
        const key = this._sourceNodeInstancePathStack.pop();
        logger.trace(`Popping ${key} off sourceNodeInstancePathStack: ${this.getSourceNodeInstancePath()} (${sourceNodeKind})`);
        // reset locally cached dependencies
        this._sourceNodeInstancePath = undefined;
        // pop from typepath if objectProperty
        if (sourceNodeKind === 'Object') {
            this._sourceNodePathStack.pop();
            // reset locally cached dependencies
            this._sourceNodePath = undefined;
        }
    }
    getSourceNodeInstancePath() {
        if (!this._sourceNodeInstancePath)
            this._sourceNodeInstancePath = this._sourceNodeInstancePathStack.join('.');
        return this._sourceNodeInstancePath || '';
    }
    getSourceNodePath() {
        if (!this._sourceNodePath)
            this._sourceNodePath = this._sourceNodePathStack.join('.');
        return this._sourceNodePath || '';
    }
    setLastSourceNodeInstancePathValue(value) {
        this._sourceObjectMap.set(this.getSourceNodeInstancePath(), value);
    }
    getLastSourceNodeInstancePathValue() {
        return this._sourceObjectMap.get(this.getSourceNodeInstancePath());
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
        const wrappedRdoNode = this.wrapRdoNode({ sourceNodePath: '', rdoNode: rootRdo, sourceNode: rootSourceNode });
        wrappedRdoNode.smartSync();
        logger.trace('smartSync - object tree sync traversal completed', { rootSourceNode, rootRdo });
    }
    /**
     *
     *
     * @memberof GraphSynchronizer
     * @description clears the previously tracked data
     */
    clearTrackedData() {
        this._sourceObjectMap.clear();
    }
}
exports.GraphSynchronizer = GraphSynchronizer;
//# sourceMappingURL=graphSynchronizer.js.map