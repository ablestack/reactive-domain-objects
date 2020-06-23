"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoMapNW = void 0;
const __1 = require("..");
const __2 = require("../..");
const logger_1 = require("../../infrastructure/logger");
const logger = logger_1.Logger.make('RdoMapNW');
class RdoMapNW extends __1.RdoCollectionNWBase {
    constructor({ value, typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, defaultEqualityComparer, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }) {
        super({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
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
        return this._value.keys();
    }
    getItem(key) {
        return this._value.get(key);
    }
    updateItem(key, value) {
        if (this._value.has(key)) {
            this._value.set(key, value);
            return true;
        }
        else
            return false;
    }
    insertItem(key, value) {
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
        const item = this._value.get(key);
        this._value.delete(key);
        return item;
    }
    clearElements() {
        if (this.childElementCount() === 0)
            return false;
        this._value.clear();
        return true;
    }
    //------------------------------
    // RdoSyncableCollectionNW
    //------------------------------
    executePatchOperations(patchOperations) {
        // Should already be in reverse index order. Loop through and execute
        for (const patchOp of patchOperations) {
            switch (patchOp.op) {
                case 'add':
                    if (!patchOp.rdo)
                        throw new Error('Rdo must not be null for patch-add operations');
                    this.value.set(patchOp.key, patchOp.rdo);
                // now fall through to update, so the values sync to the new item
                case 'update':
                    if (!patchOp.rdo)
                        throw new Error('Rdo must not be null for patch-update operations');
                    this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemValue: patchOp.rdo, rdoNodeItemKey: patchOp.key, sourceNodeItemKey: patchOp.key });
                    break;
                case 'remove':
                    this.value.delete(patchOp.key);
                    break;
                default:
                    throw new Error(`Unknown operation: ${patchOp.op}`);
                    break;
            }
        }
    }
}
exports.RdoMapNW = RdoMapNW;
//# sourceMappingURL=rdo-map-nw.js.map