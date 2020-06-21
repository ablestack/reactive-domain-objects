"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceBaseNW = void 0;
class SourceBaseNW {
    constructor({ sourceNodePath, key, typeInfo, lastSourceNode, matchingNodeOptions, globalNodeOptions, }) {
        this._typeInfo = typeInfo;
        this._key = key;
        this._sourceNodePath = sourceNodePath;
        this._lastSourceNode = lastSourceNode;
        this._matchingNodeOptions = matchingNodeOptions;
        this._globalNodeOptions = globalNodeOptions;
    }
    //------------------------------
    // ISourceNodeWrapper
    //------------------------------
    get typeInfo() {
        return this._typeInfo;
    }
    get key() {
        return this._key;
    }
    get sourceNodePath() {
        return this._sourceNodePath;
    }
    get lastSourceNode() {
        return this._lastSourceNode;
    }
    get matchingNodeOptions() {
        return this._matchingNodeOptions;
    }
    get globalNodeOptions() {
        return this._globalNodeOptions;
    }
    get wrappedRdoNode() {
        return this._wrappedRdoNode;
    }
    setRdoNode(rdoNode) {
        this._wrappedRdoNode = rdoNode;
    }
}
exports.SourceBaseNW = SourceBaseNW;
//# sourceMappingURL=source-base-nw.js.map