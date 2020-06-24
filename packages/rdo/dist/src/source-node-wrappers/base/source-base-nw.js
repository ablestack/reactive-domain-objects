"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceBaseNW = void 0;
class SourceBaseNW {
    constructor({ sourceNodeTypePath, sourceNodeInstancePath, key, typeInfo, matchingNodeOptions, globalNodeOptions, }) {
        this._typeInfo = typeInfo;
        this._key = key;
        this._sourceNodeTypePath = sourceNodeTypePath;
        this._sourceNodeInstancePath = sourceNodeInstancePath;
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
    get sourceNodeTypePath() {
        return this._sourceNodeTypePath;
    }
    get sourceNodeInstancePath() {
        return this._sourceNodeInstancePath;
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