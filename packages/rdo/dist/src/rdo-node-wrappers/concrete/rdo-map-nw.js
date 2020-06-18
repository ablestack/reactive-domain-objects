"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoMapNW = void 0;
const __1 = require("..");
const __2 = require("../..");
const logger_1 = require("../../infrastructure/logger");
const logger = logger_1.Logger.make('RdoMapNW');
class RdoMapNW extends __1.RdoCollectionNWBase {
    constructor({ value, typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }) {
        super({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
        this._value = value;
    }
    //------------------------------
    // IRdoNodeWrapper
    //------------------------------
    get value() {
        return this._value;
    }
    itemKeys() {
        return this._value.keys();
    }
    getElement(key) {
        return this._value.get(key);
    }
    updateElement(key, value) {
        if (this._value.has(key)) {
            this._value.set(key, value);
            return true;
        }
        else
            return false;
    }
    insertElement(key, value) {
        this._value.set(key, value);
    }
    //------------------------------
    // IRdoInternalNodeWrapper
    //------------------------------
    smartSync() {
        if (this.wrappedSourceNode.childElementCount() === 0 && this.childElementCount() > 0) {
            return this.clearElements();
        }
        else {
            // Validate
            if (!__2.isISourceCollectionNodeWrapper(this.wrappedSourceNode))
                throw new Error(`RDO collection nodes can only be synced with Source collection nodes (Path: '${this.wrappedSourceNode.sourceNodePath}'`);
            // Execute
            return super.synchronizeCollection();
        }
    }
    //------------------------------
    // IRdoCollectionNodeWrapper
    //------------------------------
    elements() {
        return this._value.values();
    }
    childElementCount() {
        return this._value.size;
    }
    deleteElement(key) {
        return this._value.delete(key);
    }
    clearElements() {
        if (this.childElementCount() === 0)
            return false;
        this._value.clear();
        return true;
    }
}
exports.RdoMapNW = RdoMapNW;
//# sourceMappingURL=rdo-map-nw.js.map