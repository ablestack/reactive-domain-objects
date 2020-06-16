"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncUtils = void 0;
const tslib_1 = require("tslib");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const __1 = require("../..");
const logger_1 = require("../../infrastructure/logger");
const logger = logger_1.Logger.make('SyncUtils');
/** */
function synchronizeCollection({ rdo, syncChildNode }) {
    let changed = false;
    const sourceKeys = new Array();
    const targetCollectionStartedEmpty = rdo.childElementCount() === 0;
    if (rdo.wrappedSourceNode.childElementCount() > 0) {
        if (!__1.isISourceCollectionNodeWrapper(rdo.wrappedSourceNode))
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
                targetItem = rdo.getElement(key);
            }
            if (!targetItem) {
                if (!rdo.makeRdo)
                    throw Error(`rdo.makeItem wan null or undefined. It must be defined when targetItem collection not empty`);
                targetItem = rdo.makeRdo(sourceItem);
                if (!targetItem)
                    throw Error(`rdo.targetItem produced null or undefined`);
                logger.trace(`Adding item ${key} to collection`, targetItem);
                rdo.insertElement(key, targetItem);
            }
            //
            // Sync Item
            //
            logger.trace(`Syncing item ${key} in collection`, sourceItem);
            changed = syncChildNode({ parentRdoNode: rdo, rdoNodeItemKey: key, sourceNodeItemKey: key });
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
            targetCollectionKeysInDestinationOnly.forEach((itemId) => {
                rdo.deleteElement(itemId);
            });
            changed = true;
        }
    }
    return changed;
}
//
//
//
exports.SyncUtils = { synchronizeCollection };
//# sourceMappingURL=sync.utils.js.map