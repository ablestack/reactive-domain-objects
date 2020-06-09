"use strict";
/* eslint-disable @typescript-eslint/interface-name-prefix */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsICustomEqualityRDO = exports.IsIAfterSyncIfNeeded = exports.IsIAfterSyncUpdate = exports.IsICustomSync = exports.IsIBeforeSyncUpdate = exports.IsIBeforeSyncIfNeeded = exports.IsISyncableRDOCollection = exports.IsISyncableCollection = void 0;
function IsISyncableCollection(o) {
    return (o &&
        o.getKeys &&
        typeof o.getKeys === 'function' &&
        o.tryGetItemFromTargetCollection &&
        typeof o.tryGetItemFromTargetCollection === 'function' &&
        o.insertItemToTargetCollection &&
        typeof o.insertItemToTargetCollection === 'function' &&
        o.tryDeleteItemFromTargetCollection &&
        typeof o.tryDeleteItemFromTargetCollection === 'function');
}
exports.IsISyncableCollection = IsISyncableCollection;
function IsISyncableRDOCollection(o) {
    return (o &&
        o.makeRDOCollectionKeyFromSourceElement &&
        typeof o.makeRDOCollectionKeyFromSourceElement === 'function' &&
        o.makeRDOCollectionKeyFromDomainElement &&
        typeof o.makeRDOCollectionKeyFromDomainElement === 'function' &&
        o.makeRDO &&
        typeof o.makeRDO === 'function' &&
        IsISyncableCollection(o));
}
exports.IsISyncableRDOCollection = IsISyncableRDOCollection;
function IsIBeforeSyncIfNeeded(o) {
    return o && o.beforeSyncIfNeeded && typeof o.beforeSyncIfNeeded === 'function';
}
exports.IsIBeforeSyncIfNeeded = IsIBeforeSyncIfNeeded;
function IsIBeforeSyncUpdate(o) {
    return o && o.beforeSyncUpdate && typeof o.beforeSyncUpdate === 'function';
}
exports.IsIBeforeSyncUpdate = IsIBeforeSyncUpdate;
function IsICustomSync(o) {
    return o && o.synchronizeState && typeof o.synchronizeState === 'function';
}
exports.IsICustomSync = IsICustomSync;
function IsIAfterSyncUpdate(o) {
    return o && o.afterSyncUpdate && typeof o.afterSyncUpdate === 'function';
}
exports.IsIAfterSyncUpdate = IsIAfterSyncUpdate;
function IsIAfterSyncIfNeeded(o) {
    return o && o.afterSyncIfNeeded && typeof o.afterSyncIfNeeded === 'function';
}
exports.IsIAfterSyncIfNeeded = IsIAfterSyncIfNeeded;
function IsICustomEqualityRDO(o) {
    return o && o.isStateEqual && typeof o.isStateEqual === 'function';
}
exports.IsICustomEqualityRDO = IsICustomEqualityRDO;
//# sourceMappingURL=types.js.map