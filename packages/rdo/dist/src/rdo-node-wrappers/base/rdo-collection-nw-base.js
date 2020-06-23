"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoCollectionNWBase = void 0;
const __1 = require("../..");
const logger_1 = require("../../infrastructure/logger");
const types_1 = require("../../types");
const node_type_utils_1 = require("../utils/node-type.utils");
const rdo_internal_nw_base_1 = require("./rdo-internal-nw-base");
const global_utils_1 = require("../utils/global.utils");
const logger = logger_1.Logger.make('RdoCollectionNWBase');
class RdoCollectionNWBase extends rdo_internal_nw_base_1.RdoInternalNWBase {
    constructor({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }) {
        super({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
        // protected synchronizeCollection2() {
        //   let changed = false;
        //   const operations = this.preparePatchOperations();
        //   for (const operation of operations) {
        //     switch (operation.op) {
        //       case 'add':
        //         const rdo = this.executePatchOperations;
        //         break;
        //       case 'update':
        //         break;
        //       case 'remove':
        //         break;
        //       default:
        //         throw new Error(`Unknown operation: ${operation.op}`);
        //         break;
        //     }
        //   }
        //   return changed;
        // }
        // protected synchronizeCollection() {
        //   let changed = false;
        //   const processedCollectionRdoKeys = new Array<K>();
        //   let targetCollectionInitiallyEmpty = this.childElementCount() === 0;
        //   if (this.wrappedSourceNode.childElementCount() > 0) {
        //     if (!isISourceCollectionNodeWrapper(this.wrappedSourceNode)) throw new Error('Can only sync Rdo collection types with Rdo source types');
        //     const sourceCollection = this.wrappedSourceNode.elements();
        //     for (const sourceItem of sourceCollection) {
        //       if (sourceItem === null || sourceItem === undefined) continue;
        //       // Make key
        //       const key = this.wrappedSourceNode.makeCollectionKey(sourceItem);
        //       if (!key) throw Error(`this.wrappedSourceNode.makeKey produced null or undefined. It must be defined when sourceCollection.length > 0`);
        //       let rdoKey = key;
        //       processedCollectionRdoKeys.push(rdoKey);
        //       // Get or create target item
        //       let targetItem: D | null | undefined = undefined;
        //       if (this.childElementCount() > 0) {
        //         targetItem = this.getItem(rdoKey);
        //       }
        //       // If no target item, Make
        //       if (targetItem === null || targetItem === undefined) {
        //         if (!this.makeRdoElement) throw Error(`sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - this.makeItem wan null or undefined. It must be defined when targetItem collection not empty`);
        //         targetItem = this.makeRdoElement(sourceItem);
        //         if (!targetItem) {
        //           throw Error(`sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - this.makeRdoElement produced null or undefined`);
        //         }
        //         this.insertItem(key, targetItem);
        //         changed = true;
        //         this.eventEmitter.publish('nodeChange', { changeType: 'create', sourceNodePath: this.wrappedSourceNode.sourceNodePath, sourceKey: key, rdoKey: key, oldSourceValue: undefined, newSourceValue: sourceItem });
        //       }
        //       // Update directly if Leaf node
        //       // Or else step into child and sync
        //       if (!sourceItem || NodeTypeUtils.isPrimitive(sourceItem)) {
        //         logger.trace(`Skipping child sync. Item '${key}' in collection is undefined, null, or Primitive`, sourceItem);
        //       } else {
        //         logger.trace(`Syncing item '${key}' in collection`, sourceItem);
        //         changed = this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemValue: targetItem, rdoNodeItemKey: key, sourceNodeItemKey: key }) && changed;
        //       }
        //     }
        //   }
        //   // short-cutting this check when initial collection was empty.
        //   // This id a performance optimization and also (indirectly)
        //   // allows for auto collection methods based on target item types
        //   if (!targetCollectionInitiallyEmpty) {
        //     if (!this.itemKeys) throw Error(`getTargetCollectionKeys wan null or undefined. It must be defined when targetCollection.length > 0`);
        //     if (!this.deleteElement) throw Error(`tryDeleteItemFromTargetCollection wan null or undefined. It must be defined when targetCollection.length > 0`);
        //     // If destination item missing from source - remove from destination
        //     const rdoCollectionKeys = Array.from<K>(this.itemKeys());
        //     const targetCollectionKeysInDestinationOnly = _.difference(rdoCollectionKeys, processedCollectionRdoKeys);
        //     if (targetCollectionKeysInDestinationOnly.length > 0) {
        //       targetCollectionKeysInDestinationOnly.forEach((key) => {
        //         const deletedItem = this.deleteElement(key);
        //         this.eventEmitter.publish('nodeChange', { changeType: 'delete', sourceNodePath: this.wrappedSourceNode.sourceNodePath, sourceKey: key, rdoKey: key, oldSourceValue: deletedItem, newSourceValue: undefined });
        //       });
        //       changed = true;
        //     }
        //   }
        //   return changed;
        // }
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
        this._equalityComparer = defaultEqualityComparer;
    }
    //------------------------------
    // Protected
    //------------------------------
    preparePatchOperations() {
        const operations = new Array();
        if (!types_1.isISourceCollectionNodeWrapper(this.wrappedSourceNode))
            throw new Error('Can only sync Rdo collection types with Collection source types');
        const lastSnapshot = this.wrappedSourceNode.lastSourceNode; // TODO - need to fix lastSourceNode to typed storage
        const origSourceArray = (lastSnapshot === null || lastSnapshot === void 0 ? void 0 : lastSnapshot.sourceArray) || [];
        const rdoMap = (lastSnapshot === null || lastSnapshot === void 0 ? void 0 : lastSnapshot.rdoMap) || new Map();
        const newSourceArray = this.wrappedSourceNode.value;
        const count = Math.max(origSourceArray.length, newSourceArray.length);
        for (let i = count - 1; i >= 0; i--) {
            const origSourceElement = origSourceArray[i];
            const newSourceElement = newSourceArray[i];
            let op;
            if (global_utils_1.isNullOrUndefined(origSourceElement) && !global_utils_1.isNullOrUndefined(newSourceElement)) {
                // ---------------------------
                // New Key
                // ---------------------------
                const newElementKey = this.wrappedSourceNode.makeCollectionKey(newSourceElement);
                const newRdo = this.makeRdoElement(newSourceElement);
                // Add operation
                operations.push({ op: 'add', index: i, key: newElementKey, rdo: newRdo });
                // Update Rdo Map
                rdoMap.set(newElementKey, newRdo);
            }
            else if (!global_utils_1.isNullOrUndefined(origSourceElement) && !global_utils_1.isNullOrUndefined(newSourceElement)) {
                // ---------------------------
                // Existing Key
                // ---------------------------
                const origElementKey = this.wrappedSourceNode.makeCollectionKey(origSourceElement);
                const newElementKey = this.wrappedSourceNode.makeCollectionKey(newSourceElement);
                if (origElementKey !== newElementKey) {
                    // ---------------------------
                    // Keys don't match
                    // ---------------------------
                    const origRdo = rdoMap.get(origElementKey);
                    if (!origRdo)
                        throw new Error(`Could not find original Rdo with key ${origElementKey}`);
                    const newRdo = this.makeRdoElement(newElementKey);
                    // Add operations
                    operations.push({ op: 'remove', index: i, key: origElementKey, rdo: origRdo });
                    operations.push({ op: 'add', index: i, key: newElementKey, rdo: newRdo });
                    // Update Rdo Map
                    rdoMap.delete(origElementKey);
                    rdoMap.set(newElementKey, newRdo);
                }
                else {
                    // ---------------------------
                    // Keys Match
                    // ---------------------------
                    if (this._equalityComparer(origSourceElement, newSourceElement)) {
                        // No change, no patch needed
                    }
                    else {
                        // Add operations
                        operations.push({ op: 'update', index: i, key: origElementKey });
                        // Update Rdo Map
                        // No update needed
                    }
                }
            }
            else if (!global_utils_1.isNullOrUndefined(origSourceElement) && global_utils_1.isNullOrUndefined(newSourceElement)) {
                // ---------------------------
                // Missing Key
                // ---------------------------
                const origElementKey = this.wrappedSourceNode.makeCollectionKey(origSourceElement);
                const origRdo = rdoMap.get(origElementKey);
                if (!origRdo)
                    throw new Error(`Could not find original Rdo with key ${origElementKey}`);
                // Add operations
                operations.push({ op: 'remove', index: i, key: this.wrappedSourceNode.makeCollectionKey(origSourceElement), rdo: origRdo });
                // Update Rdo Map
                rdoMap.delete(origElementKey);
            }
        }
        return operations;
    }
    synchronizeCollection() {
        let changed = false;
        const patchOperations = this.preparePatchOperations();
        console.log(`synchronizeCollection - sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - prepared patch operations`, patchOperations);
        logger.trace(`synchronizeCollection - sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - prepared patch operations`, patchOperations);
        this.executePatchOperations(patchOperations);
        return patchOperations.length > 0;
    }
}
exports.RdoCollectionNWBase = RdoCollectionNWBase;
//# sourceMappingURL=rdo-collection-nw-base.js.map