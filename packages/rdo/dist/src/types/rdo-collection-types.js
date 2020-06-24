"use strict";
/* eslint-disable @typescript-eslint/interface-name-prefix */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsISyncableRDOCollection = exports.IsISyncableCollection = exports.isIMakeRdoElement = exports.isIMakeCollectionKey = void 0;
function isIMakeCollectionKey(o) {
    return o && o.makeCollectionKey;
}
exports.isIMakeCollectionKey = isIMakeCollectionKey;
function isIMakeRdoElement(o) {
    return o && o.makeRdoElement;
}
exports.isIMakeRdoElement = isIMakeRdoElement;
function IsISyncableCollection(o) {
    return o && o.size && o.elements && o.getCollectionKeys && o.getElement && o.insertElement && o.updateElement && o.deleteElement && o.clearElements && isIMakeCollectionKey(o);
}
exports.IsISyncableCollection = IsISyncableCollection;
function IsISyncableRDOCollection(o) {
    return o && isIMakeRdoElement(o) && IsISyncableCollection(o);
}
exports.IsISyncableRDOCollection = IsISyncableRDOCollection;
//# sourceMappingURL=rdo-collection-types.js.map