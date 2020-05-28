"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatchUtils = void 0;
const tslib_1 = require("tslib");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const _1 = require(".");
const logger = _1.Logger.make('ViewModelSyncUtils');
//
// PATCHMAP
//
function patchMap({ source, destinationMap, getItemKey, createItem, synchronizeState, areEqual, }) {
    let changed = false;
    const sourceKeys = new Array();
    for (const sourceItem of source) {
        const sourceKey = getItemKey(sourceItem);
        sourceKeys.push(sourceKey);
        const destinationItem = destinationMap.get(sourceKey);
        // Source item not present in destination
        if (!destinationItem) {
            destinationMap.set(sourceKey, createItem(sourceItem));
            changed = true;
            continue;
        }
        // If source item present in destination but not equal
        if (!areEqual(sourceItem, destinationItem)) {
            logger.trace('patchMap - items not equal, updating');
            synchronizeState(sourceItem, destinationItem);
            changed = true;
            continue;
        }
    }
    // If destination item missing from source - remove from destination
    const destinationInstanceIds = Array.from(destinationMap.keys());
    const instanceIdsInDestinationOnly = lodash_1.default.difference(destinationInstanceIds, sourceKeys);
    if (instanceIdsInDestinationOnly.length > 0) {
        instanceIdsInDestinationOnly.forEach(itemId => {
            destinationMap.delete(itemId);
        });
        changed = true;
    }
    return changed;
}
//
//
//
exports.PatchUtils = { patchMap };
//# sourceMappingURL=patch.utils.js.map