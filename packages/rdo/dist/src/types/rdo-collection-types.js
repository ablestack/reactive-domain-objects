"use strict";
/* eslint-disable @typescript-eslint/interface-name-prefix */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsISyncableRDOCollection = exports.IsISyncableCollection = exports.isIMakeRdo = exports.isICollectionKeyFactory = void 0;
function isICollectionKeyFactory(o) {
    return o && o.makeKey;
}
exports.isICollectionKeyFactory = isICollectionKeyFactory;
function isIMakeRdo(o) {
    return o && o.makeRdo;
}
exports.isIMakeRdo = isIMakeRdo;
function IsISyncableCollection(o) {
    return o && o.size && o.fromRdoElement && o.insertItemToTargetCollection && o.elements && o.getCollectionKeys && o.getElement && o.insertElement && o.updateElement && o.deleteElement && o.clearElements;
}
exports.IsISyncableCollection = IsISyncableCollection;
function IsISyncableRDOCollection(o) {
    return o && isIMakeRdo(o) && IsISyncableCollection(o);
}
exports.IsISyncableRDOCollection = IsISyncableRDOCollection;
//# sourceMappingURL=rdo-collection-types.js.map