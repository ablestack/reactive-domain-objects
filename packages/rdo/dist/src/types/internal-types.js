"use strict";
/* eslint-disable @typescript-eslint/interface-name-prefix */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIMakeRdo = exports.isIRdoCollectionNodeWrapper = exports.isIRdoInternalNodeWrapper = exports.isIRdoNodeWrapper = exports.isISourceCollectionNodeWrapper = exports.isISourceInternalNodeWrapper = exports.isISourceNodeWrapper = void 0;
const rdo_collection_types_1 = require("./rdo-collection-types");
function isISourceNodeWrapper(o) {
    return o && o.typeInfo && 'value' in o && o.setRdoNode && o.childElementCount;
}
exports.isISourceNodeWrapper = isISourceNodeWrapper;
function isISourceInternalNodeWrapper(o) {
    return o && o.nodeKeys && o.getItem && isISourceNodeWrapper(o);
}
exports.isISourceInternalNodeWrapper = isISourceInternalNodeWrapper;
function isISourceCollectionNodeWrapper(o) {
    return o && o.elements && isISourceInternalNodeWrapper(o) && rdo_collection_types_1.isIMakeCollectionKey(o);
}
exports.isISourceCollectionNodeWrapper = isISourceCollectionNodeWrapper;
function isIRdoNodeWrapper(o) {
    return o && o.value !== undefined && o.typeInfo && o.wrappedSourceNode && 'ignore' in o && o.childElementCount && o.smartSync;
}
exports.isIRdoNodeWrapper = isIRdoNodeWrapper;
function isIRdoInternalNodeWrapper(o) {
    return o && o.itemKeys && o.getElement && o.updateElement && isIRdoNodeWrapper(o);
}
exports.isIRdoInternalNodeWrapper = isIRdoInternalNodeWrapper;
function isIRdoCollectionNodeWrapper(o) {
    return o && o.elements && o.insertElement && o.deleteElement && o.clearElements && rdo_collection_types_1.isIMakeRdoElement(o) && isIRdoInternalNodeWrapper(o) && rdo_collection_types_1.isIMakeCollectionKey(o);
}
exports.isIRdoCollectionNodeWrapper = isIRdoCollectionNodeWrapper;
function isIMakeRdo(o) {
    return o && o.makeRdo;
}
exports.isIMakeRdo = isIMakeRdo;
//# sourceMappingURL=internal-types.js.map