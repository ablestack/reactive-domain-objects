"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoSyncableCollectionNW = void 0;
const __1 = require("..");
const __2 = require("../..");
const logger_1 = require("../../infrastructure/logger");
const logger = logger_1.Logger.make('RdoSyncableCollectionNW');
class RdoSyncableCollectionNW extends __1.RdoCollectionNWBase {
    constructor({ value, typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }) {
        super({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
        this._value = value;
    }
    //------------------------------
    // IRdoNodeWrapper
    //------------------------------
    get leafNode() {
        return false;
    }
    get value() {
        return this._value;
    }
    itemKeys() {
        return this._value.getCollectionKeys();
    }
    getItem(key) {
        return this._value.getElement(key);
    }
    updateItem(key, value) {
        return this._value.updateElement(key, value);
    }
    //------------------------------
    // IRdoInternalNodeWrapper
    //------------------------------
    smartSync() {
        if (this.wrappedSourceNode.childElementCount() === 0 && this.childElementCount() > 0) {
            return this.clearElements();
        }
        else {
            if (!__2.isISourceCollectionNodeWrapper(this.wrappedSourceNode))
                throw new Error(`RDO collection nodes can only be synced with Source collection nodes (Path: '${this.wrappedSourceNode.sourceNodePath}'`);
            return super.synchronizeCollection();
        }
    }
    //------------------------------
    // IRdoCollectionNodeWrapper
    //------------------------------
    elements() {
        return this._value.elements();
    }
    childElementCount() {
        return this._value.size;
    }
    insertItem(key, value) {
        this._value.insertElement(key, value);
    }
    deleteElement(key) {
        return this._value.deleteElement(key);
    }
    clearElements() {
        return this._value.clearElements();
    }
}
exports.RdoSyncableCollectionNW = RdoSyncableCollectionNW;
//# sourceMappingURL=rdo-synchable-collection-nw.js.map