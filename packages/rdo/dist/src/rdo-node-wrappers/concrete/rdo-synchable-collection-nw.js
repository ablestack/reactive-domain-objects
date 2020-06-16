"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoSyncableCollectionNW = void 0;
const __1 = require("..");
const __2 = require("../..");
const logger_1 = require("../../infrastructure/logger");
const sync_utils_1 = require("../utils/sync.utils");
const logger = logger_1.Logger.make('RdoSyncableCollectionNW');
class RdoSyncableCollectionNW extends __1.RdoCollectionNWBase {
    constructor({ value, typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, }) {
        super({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions });
        this._value = value;
    }
    //------------------------------
    // IRdoNodeWrapper
    //------------------------------
    get value() {
        return this._value;
    }
    itemKeys() {
        return this._value.getCollectionKeys();
    }
    getElement(key) {
        return this._value.getElement(key);
    }
    updateElement(key, value) {
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
            return sync_utils_1.SyncUtils.synchronizeCollection({ rdo: this, syncChildNode: this._syncChildNode });
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
    insertElement(value) {
        this._value.insertElement(value);
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