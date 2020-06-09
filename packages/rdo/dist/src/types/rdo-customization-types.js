"use strict";
//--------------------------------------------------------
// RDO - SYNC CUSTOMIZATION INTERFACES TYPES
//-------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsIAfterSyncIfNeeded = exports.IsIAfterSyncUpdate = exports.IsIBeforeSyncUpdate = exports.IsIBeforeSyncIfNeeded = exports.IsICustomEqualityRDO = exports.IsICustomSync = exports.IsIHasCustomRdoFieldNames = void 0;
function IsIHasCustomRdoFieldNames(o) {
    return o && o.tryGetRdoFieldname && typeof o.tryGetRdoFieldname === 'function';
}
exports.IsIHasCustomRdoFieldNames = IsIHasCustomRdoFieldNames;
function IsICustomSync(o) {
    return o && o.synchronizeState && typeof o.synchronizeState === 'function';
}
exports.IsICustomSync = IsICustomSync;
function IsICustomEqualityRDO(o) {
    return o && o.isStateEqual && typeof o.isStateEqual === 'function';
}
exports.IsICustomEqualityRDO = IsICustomEqualityRDO;
function IsIBeforeSyncIfNeeded(o) {
    return o && o.beforeSyncIfNeeded && typeof o.beforeSyncIfNeeded === 'function';
}
exports.IsIBeforeSyncIfNeeded = IsIBeforeSyncIfNeeded;
function IsIBeforeSyncUpdate(o) {
    return o && o.beforeSyncUpdate && typeof o.beforeSyncUpdate === 'function';
}
exports.IsIBeforeSyncUpdate = IsIBeforeSyncUpdate;
function IsIAfterSyncUpdate(o) {
    return o && o.afterSyncUpdate && typeof o.afterSyncUpdate === 'function';
}
exports.IsIAfterSyncUpdate = IsIAfterSyncUpdate;
function IsIAfterSyncIfNeeded(o) {
    return o && o.afterSyncIfNeeded && typeof o.afterSyncIfNeeded === 'function';
}
exports.IsIAfterSyncIfNeeded = IsIAfterSyncIfNeeded;
//# sourceMappingURL=rdo-customization-types.js.map