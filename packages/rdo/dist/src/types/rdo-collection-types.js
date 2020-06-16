"use strict";
/* eslint-disable @typescript-eslint/interface-name-prefix */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsISyncableRDOCollection = exports.IsISyncableCollection = exports.isIMakeRdo = exports.isIMakeCollectionKeyFromRdoElement = exports.isIMakeCollectionKeyFromSourceElement = exports.isIMakeCollectionKey = void 0;
function isIMakeCollectionKey(o) {
    return o && o.makeCollectionKey;
}
exports.isIMakeCollectionKey = isIMakeCollectionKey;
function isIMakeCollectionKeyFromSourceElement(o) {
    return o && o.makeCollectionKeyFromSourceElement;
}
exports.isIMakeCollectionKeyFromSourceElement = isIMakeCollectionKeyFromSourceElement;
function isIMakeCollectionKeyFromRdoElement(o) {
    return o && o.makeCollectionKeyFromRdoElement;
}
exports.isIMakeCollectionKeyFromRdoElement = isIMakeCollectionKeyFromRdoElement;
function isIMakeRdo(o) {
    return o && o.makeRdo;
}
exports.isIMakeRdo = isIMakeRdo;
function IsISyncableCollection(o) {
    return (o &&
        o.size &&
        o.fromRdoElement &&
        o.insertItemToTargetCollection &&
        o.elements &&
        o.getCollectionKeys &&
        o.getElement &&
        o.insertElement &&
        o.updateElement &&
        o.deleteElement &&
        o.clearElements &&
        isIMakeCollectionKeyFromSourceElement(o) &&
        isIMakeCollectionKeyFromRdoElement(o));
}
exports.IsISyncableCollection = IsISyncableCollection;
function IsISyncableRDOCollection(o) {
    return o && isIMakeRdo(o) && IsISyncableCollection(o);
}
exports.IsISyncableRDOCollection = IsISyncableRDOCollection;
//# sourceMappingURL=rdo-collection-types.js.map