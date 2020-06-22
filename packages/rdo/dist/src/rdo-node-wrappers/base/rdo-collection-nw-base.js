"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoCollectionNWBase = void 0;
const tslib_1 = require("tslib");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const __1 = require("../..");
const logger_1 = require("../../infrastructure/logger");
const types_1 = require("../../types");
const node_type_utils_1 = require("../utils/node-type.utils");
const rdo_internal_nw_base_1 = require("./rdo-internal-nw-base");
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
        //       this._childElementSourceNodeKind = NodeTypeUtils.getNodeType(firstElement).kind;
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
                const key = item;
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
        const syncChildNode = this._syncChildNode;
        let changed = false;
        const sourceKeys = new Array();
        let targetCollectionInitiallyEmpty = this.childElementCount() === 0;
        if (this.wrappedSourceNode.childElementCount() > 0) {
            if (!types_1.isISourceCollectionNodeWrapper(this.wrappedSourceNode))
                throw new Error('Can only sync Rdo collection types with Rdo source types');
            const sourceCollection = this.wrappedSourceNode.elements();
            for (const sourceItem of sourceCollection) {
                if (sourceItem === null || sourceItem === undefined)
                    continue;
                // Make key
                const key = this.wrappedSourceNode.makeCollectionKey(sourceItem);
                if (!key)
                    throw Error(`this.wrappedSourceNode.makeKey produced null or undefined. It must be defined when sourceCollection.length > 0`);
                // Track keys so can be used in target item removal later
                sourceKeys.push(key);
                // Get or create target item
                let targetItem = undefined;
                if (this.childElementCount() > 0) {
                    targetItem = this.getItem(key);
                }
                // If no target item, Make
                if (targetItem === null || targetItem === undefined) {
                    if (!this.makeRdoElement)
                        throw Error(`sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - this.makeItem wan null or undefined. It must be defined when targetItem collection not empty`);
                    targetItem = this.makeRdoElement(sourceItem);
                    if (!targetItem) {
                        throw Error(`sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - this.makeRdoElement produced null or undefined`);
                    }
                    this.insertItem(key, targetItem);
                    changed = true;
                    this.eventEmitter.publish('nodeChange', { changeType: 'create', sourceNodePath: this.wrappedSourceNode.sourceNodePath, sourceKey: key, rdoKey: key, oldSourceValue: undefined, newSourceValue: sourceItem });
                }
                // Update directly if Leaf node
                // Or else step into child and sync
                if (!sourceItem || node_type_utils_1.NodeTypeUtils.isPrimitive(sourceItem)) {
                    logger.trace(`Skipping child sync. Item '${key}' in collection is undefined, null, or Primitive`, sourceItem);
                }
                else {
                    logger.trace(`Syncing item '${key}' in collection`, sourceItem);
                    changed = syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemValue: targetItem, rdoNodeItemKey: key, sourceNodeItemKey: key }) && changed;
                }
            }
        }
        // short-cutting this check when initial collection was empty.
        // This id a performance optimization and also (indirectly)
        // allows for auto collection methods based on target item types
        if (!targetCollectionInitiallyEmpty) {
            if (!this.itemKeys)
                throw Error(`getTargetCollectionKeys wan null or undefined. It must be defined when targetCollection.length > 0`);
            if (!this.deleteElement)
                throw Error(`tryDeleteItemFromTargetCollection wan null or undefined. It must be defined when targetCollection.length > 0`);
            // If destination item missing from source - remove from destination
            const targetCollectionKeys = Array.from(this.itemKeys());
            const targetCollectionKeysInDestinationOnly = lodash_1.default.difference(targetCollectionKeys, sourceKeys);
            if (targetCollectionKeysInDestinationOnly.length > 0) {
                targetCollectionKeysInDestinationOnly.forEach((key) => {
                    const deletedItem = this.deleteElement(key);
                    this.eventEmitter.publish('nodeChange', { changeType: 'delete', sourceNodePath: this.wrappedSourceNode.sourceNodePath, sourceKey: key, rdoKey: key, oldSourceValue: deletedItem, newSourceValue: undefined });
                });
                changed = true;
            }
        }
        return changed;
    }
}
exports.RdoCollectionNWBase = RdoCollectionNWBase;
//# sourceMappingURL=rdo-collection-nw-base.js.map