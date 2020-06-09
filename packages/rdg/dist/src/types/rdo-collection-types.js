"use strict";
/* eslint-disable @typescript-eslint/interface-name-prefix */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsISyncableRDOCollection = exports.IsISyncableCollection = void 0;
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
        o.makeRdoCollectionKeyFromRdoElement &&
        typeof o.makeRdoCollectionKeyFromRdoElement === 'function' &&
        o.makeRDO &&
        typeof o.makeRDO === 'function' &&
        IsISyncableCollection(o));
}
exports.IsISyncableRDOCollection = IsISyncableRDOCollection;
/***************************************************************************
 * NOTES:
 *
 * Node Sync Options
 *
 * We have *Strict interfaces is because we want to support one internal
 * use case where a `fromRdoElement` factory does not need to be supplied, but in all user-config supplied
 * use cases, require both `fromSourceElement` and `fromRdoElement` for a DomainNodeKeyFactory config
 *
 *****************************************************************************/
//# sourceMappingURL=rdo-collection-types.js.map