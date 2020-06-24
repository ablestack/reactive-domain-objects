"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceObjectNW = void 0;
const source_base_nw_1 = require("../base/source-base-nw");
class SourceObjectNW extends source_base_nw_1.SourceBaseNW {
    constructor({ value, sourceNodeTypePath, sourceNodeInstancePath, key, typeInfo, matchingNodeOptions, globalNodeOptions, }) {
        super({ sourceNodeTypePath, sourceNodeInstancePath, key, typeInfo, matchingNodeOptions, globalNodeOptions });
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
    //------------------------------
    // ISourceInternalNodeWrapper
    //------------------------------
    //@ts-ignore
    nodeKeys() {
        return ((this._value && Object.keys(this._value)) || []);
    }
    getItem(key) {
        return this._value && this._value[key];
    }
}
exports.SourceObjectNW = SourceObjectNW;
//# sourceMappingURL=source-object-nw.js.map