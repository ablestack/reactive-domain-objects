"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncUtils = void 0;
const tslib_1 = require("tslib");
const equality_1 = tslib_1.__importDefault(require("@wry/equality"));
const _1 = require(".");
const mobx_1 = require("mobx");
const logger = _1.Logger.make('ViewModelSyncUtils');
//
// AUTOSYNCHRONIZE
//
function _autoSynchronize({ sourceData, syncableObject }) {
    for (const key of Object.keys(sourceData)) {
        if (!(key in syncableObject))
            continue;
        // get corresponding property from syncableObject
        const sourcePropVal = sourceData[key];
        const destinationPropVal = syncableObject[key];
        const t = typeof destinationPropVal;
        //
        switch (t) {
            case 'number':
            case 'string':
            case 'boolean':
            case 'bigint': {
                if (sourcePropVal !== destinationPropVal) {
                    syncableObject[key] = sourcePropVal;
                }
                continue;
            }
        }
        // ISyncableObject, synchronize
        if (_1.isISyncableObject(destinationPropVal)) {
            // Only synchronize if not equal
            syncronizeISyncableObject({ sourceData: sourcePropVal, syncableObject: destinationPropVal });
            continue;
        }
    }
}
/** */
function syncronizeISyncableObject({ sourceData, syncableObject }) {
    if (!areEqual(sourceData, syncableObject.lastSourceData)) {
        if (syncableObject.synchronizeState) {
            // If custom synchronizeState method defined, use that, else recursively autoSync
            syncableObject.synchronizeState(sourceData);
        }
        else {
            _autoSynchronize({ sourceData: sourceData, syncableObject: syncableObject });
        }
    }
    syncableObject.lastSourceData = sourceData;
}
function areEqual(sourceItem, syncableObject) {
    //equalityCheck defaults to @wry/equality, but can be overriden with a custom comparer
    if (syncableObject.areEqual)
        return syncableObject.areEqual(sourceItem, syncableObject.lastSourceData);
    else
        return equality_1.default(sourceItem, syncableObject.lastSourceData);
}
/** */
function autoSynchronize({ rootSourceData, rootSyncableObject }) {
    if (rootSourceData === undefined || rootSourceData === null || !rootSyncableObject)
        return;
    mobx_1.runInAction('autoSynchronize', () => {
        syncronizeISyncableObject({ sourceData: rootSourceData, syncableObject: rootSyncableObject });
    });
}
//
//
//
exports.SyncUtils = { autoSynchronize, areEqual };
//# sourceMappingURL=sync.utils.js.map