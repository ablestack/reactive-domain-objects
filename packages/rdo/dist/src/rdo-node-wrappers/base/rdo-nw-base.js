"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoNWBase = void 0;
const logger_1 = require("../../infrastructure/logger");
const logger = logger_1.Logger.make('RdoMapNW');
class RdoNWBase {
    constructor({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, matchingNodeOptions, globalNodeOptions, }) {
        this._typeInfo = typeInfo;
        this._key = key;
        this._parent = wrappedParentRdoNode;
        this._wrappedSourceNode = wrappedSourceNode;
        this._matchingNodeOptions = matchingNodeOptions;
        this._globalNodeOptions = globalNodeOptions;
        // link Rdo node to source node
        wrappedSourceNode.setRdoNode(this);
    }
    //------------------------------
    // IRdoNodeWrapper
    //------------------------------
    get ignore() {
        var _a;
        return (this._matchingNodeOptions && ((_a = this.matchingNodeOptions) === null || _a === void 0 ? void 0 : _a.ignore)) || false;
    }
    get key() {
        return this._key;
    }
    get wrappedParentRdoNode() {
        return this._parent;
    }
    get typeInfo() {
        return this._typeInfo;
    }
    get wrappedSourceNode() {
        return this._wrappedSourceNode;
    }
    get matchingNodeOptions() {
        return this._matchingNodeOptions;
    }
    get globalNodeOptions() {
        return this._globalNodeOptions;
    }
}
exports.RdoNWBase = RdoNWBase;
//# sourceMappingURL=rdo-nw-base.js.map