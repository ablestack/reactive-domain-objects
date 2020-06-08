"use strict";
/* eslint-disable @typescript-eslint/interface-name-prefix */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsICustomEqualityDomainModel = exports.IsIAfterSyncIfNeeded = exports.IsIAfterSyncUpdate = exports.IsICustomSync = exports.IsIBeforeSyncUpdate = exports.IsIBeforeSyncIfNeeded = exports.IsISyncableCollection = exports.IsIDomainModelFactory = void 0;
// --------------------------------------------------
// Types relating to sync custom behavior and options
// --------------------------------------------------
function IsIDomainModelFactory(o) {
    return (o &&
        o.makeDomainNodeKeyFromSourceNode &&
        typeof o.makeDomainNodeKeyFromSourceNode === 'function' &&
        o.makeDomainNodeKeyFromDomainNode &&
        typeof o.makeDomainNodeKeyFromDomainNode === 'function' &&
        o.makeDomainModel &&
        typeof o.makeDomainModel === 'function');
}
exports.IsIDomainModelFactory = IsIDomainModelFactory;
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
function IsICustomEqualityDomainModel(o) {
    return o && o.isStateEqual && typeof o.isStateEqual === 'function';
}
exports.IsICustomEqualityDomainModel = IsICustomEqualityDomainModel;
//# sourceMappingURL=types.js.map