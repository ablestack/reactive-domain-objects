"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncUtils = void 0;
const tslib_1 = require("tslib");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const logger_1 = require("../infrastructure/logger");
const logger = logger_1.Logger.make('SyncUtils');
/** */
function synchronizeCollection({ sourceCollection, getTargetCollectionSize, getTargetCollectionKeys, makeDomainNodeKeyFromSourceNode, makeItemForTargetCollection, tryGetItemFromTargetCollection, insertItemToTargetCollection, tryDeleteItemFromTargetCollection, trySyncElement, }) {
    let changed = false;
    const sourceKeys = new Array();
    const targetCollectionStartedEmpty = getTargetCollectionSize() === 0;
    for (const sourceItem of sourceCollection) {
        if (sourceItem === null || sourceItem === undefined)
            continue;
        // Make key
        if (!makeDomainNodeKeyFromSourceNode)
            throw Error(`makeDomainNodeKeyFromSourceNode wan null or undefined. It must be defined when sourceCollection.length > 0`);
        const key = makeDomainNodeKeyFromSourceNode(sourceItem);
        // Track keys so can be used in target item removal later
        sourceKeys.push(key);
        // Get or create target item
        let targetItem = undefined;
        if (!targetCollectionStartedEmpty) {
            if (!tryGetItemFromTargetCollection)
                throw Error(`tryGetItemFromTargetCollection wan null or undefined. It must be defined when targetCollection.length > 0`);
            targetItem = tryGetItemFromTargetCollection(key);
        }
        if (!targetItem) {
            targetItem = makeItemForTargetCollection(sourceItem);
            logger.trace(`Adding item ${key} to collection`, targetItem);
            insertItemToTargetCollection(key, targetItem);
        }
        //
        // Sync Item
        //
        logger.trace(`Syncing item ${key} in collection`, sourceItem);
        changed = trySyncElement({ sourceElementKey: key, sourceElementVal: sourceItem, targetElementKey: key, targetElementVal: targetItem });
        continue;
    }
    // short-cutting this check when initial collection was empty.
    // This id a performance optimization and also (indirectly)
    // allows for auto collection methods based on target item types
    if (!targetCollectionStartedEmpty) {
        if (!getTargetCollectionKeys)
            throw Error(`getTargetCollectionKeys wan null or undefined. It must be defined when targetCollection.length > 0`);
        if (!tryDeleteItemFromTargetCollection)
            throw Error(`tryDeleteItemFromTargetCollection wan null or undefined. It must be defined when targetCollection.length > 0`);
        // If destination item missing from source - remove from destination
        const destinationInstanceIds = getTargetCollectionKeys();
        const instanceIdsInDestinationOnly = lodash_1.default.difference(destinationInstanceIds, sourceKeys);
        if (instanceIdsInDestinationOnly.length > 0) {
            instanceIdsInDestinationOnly.forEach((itemId) => {
                tryDeleteItemFromTargetCollection(itemId);
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