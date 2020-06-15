"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoInternalNWBase = void 0;
const logger_1 = require("../../infrastructure/logger");
const _1 = require(".");
const logger = logger_1.Logger.make('RdoMapNW');
class RdoInternalNWBase extends _1.RdoNWBase {
    constructor({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, }) {
        super({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, matchingNodeOptions, globalNodeOptions });
        this._syncChildNode = syncChildNode;
    }
}
exports.RdoInternalNWBase = RdoInternalNWBase;
//# sourceMappingURL=rdo-internal-nw-base.js.map