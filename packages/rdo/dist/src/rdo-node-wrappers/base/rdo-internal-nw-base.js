"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoInternalNWBase = void 0;
const logger_1 = require("../../infrastructure/logger");
const rdo_nw_base_1 = require("./rdo-nw-base");
const logger = logger_1.Logger.make('RdoMapNW');
class RdoInternalNWBase extends rdo_nw_base_1.RdoNWBase {
    constructor({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, }) {
        super({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray });
        this._syncChildNode = syncChildNode;
    }
}
exports.RdoInternalNWBase = RdoInternalNWBase;
//# sourceMappingURL=rdo-internal-nw-base.js.map