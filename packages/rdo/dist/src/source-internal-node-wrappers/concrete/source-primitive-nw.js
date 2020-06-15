"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourcePrimitiveNW = void 0;
const source_base_nw_1 = require("../base/source-base-nw");
class SourcePrimitiveNW extends source_base_nw_1.SourceBaseNW {
    constructor({ value, sourceNodePath, key, typeInfo, lastSourceNode, matchingNodeOptions, globalNodeOptions, }) {
        super({ sourceNodePath, key, typeInfo, lastSourceNode, matchingNodeOptions, globalNodeOptions });
        this._value = value;
    }
    //------------------------------
    // ISourceNodeWrapper
    //------------------------------
    get value() {
        return this._value;
    }
    childElementCount() {
        return 0;
    }
}
exports.SourcePrimitiveNW = SourcePrimitiveNW;
//# sourceMappingURL=source-primitive-nw.js.map