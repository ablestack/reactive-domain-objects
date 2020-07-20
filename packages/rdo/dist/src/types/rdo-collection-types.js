"use strict";
/* eslint-disable @typescript-eslint/interface-name-prefix */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsISyncableRDOCollection = exports.IsISyncableCollection = exports.isIRdoKeyBasedCollectionNodeWrapper = exports.isIRdoCollectionNodeWrapper = exports.isIMakeRdoElement = exports.isIMakeCollectionKey = exports.isITryMakeCollectionKey = void 0;
const internal_types_1 = require("./internal-types");
function isITryMakeCollectionKey(o) {
    return o && o.tryMakeCollectionKey;
}
exports.isITryMakeCollectionKey = isITryMakeCollectionKey;
function isIMakeCollectionKey(o) {
    return o && o.makeCollectionKey;
}
exports.isIMakeCollectionKey = isIMakeCollectionKey;
function isIMakeRdoElement(o) {
    return o && o.makeRdoElement;
}
exports.isIMakeRdoElement = isIMakeRdoElement;
function isIRdoCollectionNodeWrapper(o) {
    return o && o.elements && internal_types_1.isIRdoInternalNodeWrapper(o) && isIMakeCollectionKey(o);
}
exports.isIRdoCollectionNodeWrapper = isIRdoCollectionNodeWrapper;
function isIRdoKeyBasedCollectionNodeWrapper(o) {
    return o && o.onNewKey && o.onReplaceKey && o.onDeleteKey && isIRdoCollectionNodeWrapper(o);
}
exports.isIRdoKeyBasedCollectionNodeWrapper = isIRdoKeyBasedCollectionNodeWrapper;
function IsISyncableCollection(o) {
    return o && o.size !== undefined && o.elements && o.patchAdd && o.patchDelete && isIMakeCollectionKey(o);
}
exports.IsISyncableCollection = IsISyncableCollection;
function IsISyncableRDOCollection(o) {
    return o && isIMakeRdoElement(o) && IsISyncableCollection(o);
}
exports.IsISyncableRDOCollection = IsISyncableRDOCollection;
//# sourceMappingURL=rdo-collection-types.js.map