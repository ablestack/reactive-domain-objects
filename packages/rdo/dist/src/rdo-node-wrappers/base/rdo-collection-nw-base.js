"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoCollectionNWBase = void 0;
const tslib_1 = require("tslib");
const __1 = require("../..");
const logger_1 = require("../../infrastructure/logger");
const rdo_internal_nw_base_1 = require("./rdo-internal-nw-base");
const node_type_utils_1 = require("../utils/node-type.utils");
const types_1 = require("../../types");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const logger = logger_1.Logger.make('RdoCollectionNWBase');
class RdoCollectionNWBase extends rdo_internal_nw_base_1.RdoInternalNWBase {
    constructor({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }) {
        super({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
        //------------------------------
        // IRdoCollectionNodeWrapper
        //------------------------------
        // private _childElementSourceNodeKind: ChildElementsNodeKind | undefined = undefined;
        // public get childElementsNodeKind(): ChildElementsNodeKind {
        //   if (!this._childElementSourceNodeKind) {
        //     // Try and get element type from source collection
        //     const firstElement = this.elements()[Symbol.iterator]().next().value;
        //     if (firstElement) {
        //       this._childElementSourceNodeKind = NodeTypeUtils.getRdoNodeType(firstElement).kind;
        //     } else this._childElementSourceNodeKind = null;
        //   }
        //   return this._childElementSourceNodeKind;
        // }
        this.makeCollectionKey = (item) => {
            var _a, _b, _c;
            // Use IMakeCollectionKey provided on options if available
            if ((_b = (_a = this.getNodeOptions()) === null || _a === void 0 ? void 0 : _a.makeRdoCollectionKey) === null || _b === void 0 ? void 0 : _b.fromRdoElement) {
                const key = this.getNodeOptions().makeRdoCollectionKey.fromRdoElement(item);
                logger.trace(`makeCollectionKey - sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - making key from nodeOptions: ${key}`);
                return key;
            }
            if (types_1.isIMakeCollectionKeyFromRdoElement(this.value)) {
                const key = this.value.makeCollectionKeyFromRdoElement(item);
                logger.trace(`makeCollectionKey - sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - making key from IMakeCollectionKeyFromRdoElement: ${key}`);
                return key;
            }
            // If primitive, the item is the key
            if (node_type_utils_1.NodeTypeUtils.isPrimitive(item)) {
                const key = String(item);
                logger.trace(`makeCollectionKey - sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - making key from Primitive value: ${key}`);
                return key;
            }
            // Look for idKey
            if (__1.config.defaultIdKey in item) {
                const key = item[__1.config.defaultIdKey];
                logger.trace(`makeCollectionKey - sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - making key from defaultIdKey: ${key}`);
                return key;
            }
            // Look for idKey with common postfix
            if ((_c = this.globalNodeOptions) === null || _c === void 0 ? void 0 : _c.commonRdoFieldnamePostfix) {
                const defaultIdKeyWithPostfix = `${__1.config.defaultIdKey}${this.globalNodeOptions.commonRdoFieldnamePostfix}`;
                if (defaultIdKeyWithPostfix in item) {
                    const key = item[defaultIdKeyWithPostfix];
                    logger.trace(`makeCollectionKey - sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - making key from defaultIdKeyWithPostfix: ${key}`);
                    return key;
                }
            }
            throw new Error(`Path: ${this.wrappedSourceNode.sourceNodePath} - could not find makeKeyFromRdoElement implementation either via config or interface. See documentation for details`);
        };
    }
    //------------------------------
    // Protected
    //------------------------------
    synchronizeCollection() {
        const rdo = this;
        const syncChildNode = this._syncChildNode;
        let changed = false;
        const sourceKeys = new Array();
        const targetCollectionStartedEmpty = rdo.childElementCount() === 0;
        if (rdo.wrappedSourceNode.childElementCount() > 0) {
            if (!types_1.isISourceCollectionNodeWrapper(rdo.wrappedSourceNode))
                throw new Error('Can only sync Rdo collection types with Rdo source types');
            const sourceCollection = rdo.wrappedSourceNode.elements();
            for (const sourceItem of sourceCollection) {
                if (sourceItem === null || sourceItem === undefined)
                    continue;
                // Make key
                const key = rdo.wrappedSourceNode.makeCollectionKey(sourceItem);
                if (!key)
                    throw Error(`rdo.wrappedSourceNode.makeKey produced null or undefined. It must be defined when sourceCollection.length > 0`);
                // Track keys so can be used in target item removal later
                sourceKeys.push(key);
                // Get or create target item
                let targetItem = undefined;
                if (!targetCollectionStartedEmpty) {
                    logger.trace(`sourceNodePath: ${rdo.wrappedSourceNode.sourceNodePath} - Found item ${key} in rdoCollection`, targetItem);
                    targetItem = rdo.getElement(key);
                }
                if (!targetItem) {
                    if (!rdo.makeRdoElement)
                        throw Error(`sourceNodePath: ${rdo.wrappedSourceNode.sourceNodePath} - rdo.makeItem wan null or undefined. It must be defined when targetItem collection not empty`);
                    targetItem = rdo.makeRdoElement(sourceItem);
                    if (!targetItem) {
                        throw Error(`sourceNodePath: ${rdo.wrappedSourceNode.sourceNodePath} - rdo.makeRdoElement produced null or undefined`);
                    }
                    logger.trace(`sourceNodePath: ${rdo.wrappedSourceNode.sourceNodePath} - Adding item ${key} to collection`, targetItem);
                    rdo.insertElement(key, targetItem);
                    this.eventEmitter.publish('nodeChange', { changeType: 'create', sourceNodePath: rdo.wrappedSourceNode.sourceNodePath, sourceKey: key, rdoKey: key, rdoOldValue: undefined, rdoNewValue: targetItem });
                }
                //
                // Sync Item
                //
                logger.trace(`Syncing item ${key} in collection`, sourceItem);
                changed = syncChildNode({ wrappedParentRdoNode: rdo, rdoNodeItemValue: targetItem, rdoNodeItemKey: key, sourceNodeItemKey: key });
                continue;
            }
        }
        // short-cutting this check when initial collection was empty.
        // This id a performance optimization and also (indirectly)
        // allows for auto collection methods based on target item types
        if (!targetCollectionStartedEmpty) {
            if (!rdo.itemKeys)
                throw Error(`getTargetCollectionKeys wan null or undefined. It must be defined when targetCollection.length > 0`);
            if (!rdo.deleteElement)
                throw Error(`tryDeleteItemFromTargetCollection wan null or undefined. It must be defined when targetCollection.length > 0`);
            // If destination item missing from source - remove from destination
            const targetCollectionKeys = Array.from(rdo.itemKeys());
            const targetCollectionKeysInDestinationOnly = lodash_1.default.difference(targetCollectionKeys, sourceKeys);
            if (targetCollectionKeysInDestinationOnly.length > 0) {
                targetCollectionKeysInDestinationOnly.forEach((key) => {
                    const deletedItem = rdo.deleteElement(key);
                    this.eventEmitter.publish('nodeChange', { changeType: 'delete', sourceNodePath: rdo.wrappedSourceNode.sourceNodePath, sourceKey: key, rdoKey: key, rdoOldValue: deletedItem, rdoNewValue: undefined });
                });
                changed = true;
            }
        }
        return changed;
    }
    makeRdoElement(sourceObject) {
        var _a, _b, _c, _d;
        let rdo = undefined;
        if ((_a = this.getNodeOptions()) === null || _a === void 0 ? void 0 : _a.makeRdo) {
            rdo = this.getNodeOptions().makeRdo(sourceObject, this);
            logger.trace(`makeRdoElement - sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - making RDO from nodeOptions`, sourceObject, rdo);
        }
        if (!rdo && types_1.isIMakeRdo(this.value)) {
            rdo = this.value.makeRdo(sourceObject, this);
            logger.trace(`makeRdoElement - sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - making RDO from IMakeRdo`, sourceObject, rdo);
        }
        if (!rdo && ((_b = this.globalNodeOptions) === null || _b === void 0 ? void 0 : _b.makeRdo)) {
            rdo = this.globalNodeOptions.makeRdo(sourceObject, this);
            logger.trace(`makeRdoElement - sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - making RDO from globalNodeOptions`, sourceObject, rdo);
        }
        if (!rdo && node_type_utils_1.NodeTypeUtils.isPrimitive(sourceObject)) {
            rdo = sourceObject;
            logger.trace(`makeRdoElement - sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - making RDO from primitive`, sourceObject, rdo);
        }
        // Auto-create Rdo object field if autoInstantiateRdoItems.collectionItemsAsObservableObjectLiterals
        // Note: this creates an observable tree in the exact shape of the source data
        // It is recommended to consistently use autoMakeRdo* OR consistently provide customMakeRdo methods. Blending both can lead to unexpected behavior
        // Keys made here, instantiation takes place in downstream constructors
        if (!rdo && ((_d = (_c = this.globalNodeOptions) === null || _c === void 0 ? void 0 : _c.autoInstantiateRdoItems) === null || _d === void 0 ? void 0 : _d.collectionItemsAsObservableObjectLiterals)) {
            rdo = sourceObject;
            logger.trace(`makeRdoElement - sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - making RDO from autoInstantiateRdoItems`, sourceObject, rdo);
        }
        return rdo;
    }
}
exports.RdoCollectionNWBase = RdoCollectionNWBase;
//# sourceMappingURL=rdo-collection-nw-base.js.map