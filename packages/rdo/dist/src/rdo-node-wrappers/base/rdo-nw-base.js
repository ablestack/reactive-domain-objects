"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoNWBase = void 0;
const logger_1 = require("../../infrastructure/logger");
const types_1 = require("../../types");
const logger = logger_1.Logger.make('RdoMapNW');
class RdoNWBase {
    constructor({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, }) {
        this._typeInfo = typeInfo;
        this._key = key;
        this._parent = wrappedParentRdoNode;
        this._wrappedSourceNode = wrappedSourceNode;
        this._matchingNodeOptions = matchingNodeOptions;
        this._globalNodeOptions = globalNodeOptions;
        this._targetedOptionMatchersArray = targetedOptionMatchersArray;
        // link Rdo node to source node
        wrappedSourceNode.setRdoNode(this);
    }
    //------------------------------
    // IRdoNodeWrapper
    //------------------------------
    get ignore() {
        var _a;
        return ((_a = this.getNodeOptions()) === null || _a === void 0 ? void 0 : _a.ignore) || false;
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
    get globalNodeOptions() {
        return this._globalNodeOptions;
    }
    getNodeOptions() {
        if (this._nodeOptions === undefined) {
            // Look for node options from path match
            if (this._matchingNodeOptions) {
                this._nodeOptions = this._matchingNodeOptions;
                // Look for node options from targetOptionMatchers
            }
            else if (this._targetedOptionMatchersArray) {
                let firstElement = undefined;
                // Try to get first element from either collection for matching
                if (this.wrappedSourceNode.childElementCount() > 0 && types_1.isISourceCollectionNodeWrapper(this.wrappedSourceNode)) {
                    firstElement = this.wrappedSourceNode.elements()[Symbol.iterator]().next().value;
                }
                else if (this.childElementCount() > 0 && types_1.isIRdoCollectionNodeWrapper(this)) {
                    firstElement = this.elements()[Symbol.iterator]().next().value;
                }
                // If element found, use to test against matchers
                if (firstElement) {
                    console.log(`this._targetedOptionMatchersArray`, this._targetedOptionMatchersArray);
                    this._nodeOptions = this._targetedOptionMatchersArray.find((targetOptionMatcher) => targetOptionMatcher.sourceNodeMatcher.nodeContent && targetOptionMatcher.sourceNodeMatcher.nodeContent(firstElement)) || null;
                }
                else {
                    this._nodeOptions = null;
                }
                // No matching node options. Set to null
            }
            else {
                this._nodeOptions = null;
            }
        }
        return this._nodeOptions;
    }
}
exports.RdoNWBase = RdoNWBase;
//# sourceMappingURL=rdo-nw-base.js.map