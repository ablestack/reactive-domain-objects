"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoSyncableCollectionNW = void 0;
const __1 = require("..");
const logger_1 = require("../../infrastructure/logger");
const logger = logger_1.Logger.make('RdoSyncableCollectionNW');
class RdoSyncableCollectionNW extends __1.RdoCollectionNWBase {
    constructor({ value, typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, defaultEqualityComparer, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }) {
        super({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, defaultEqualityComparer, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
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
    // public itemKeys() {
    //   return this._value.getCollectionKeys();
    // }
    // public getItem(key: K) {
    //   return this._value.getElement(key);
    // }
    // public updateItem(key: K, value: D) {
    //   return this._value.updateElement(key, value);
    // }
    //------------------------------
    // IRdoInternalNodeWrapper
    //------------------------------
    // public smartSync(): boolean {
    //   if (this.wrappedSourceNode.childElementCount() === 0 && this.childElementCount() > 0) {
    //     return this.clearElements();
    //   } else {
    //     if (!isISourceCollectionNodeWrapper(this.wrappedSourceNode)) throw new Error(`RDO collection nodes can only be synced with Source collection nodes (Path: '${this.wrappedSourceNode.sourceNodeTypePath}'`);
    //     return super.synchronizeCollection();
    //   }
    // }
    //------------------------------
    // IRdoCollectionNodeWrapper
    //------------------------------
    elements() {
        return this._value.elements();
    }
    childElementCount() {
        return this._value.size;
    }
    // public insertItem(key: K, value: D) {
    //   this._value.insertElement(key, value);
    // }
    // public deleteElement(key: K): D | undefined {
    //   return this._value.deleteElement(key);
    // }
    // public clearElements(): boolean {
    //   return this._value.clearElements();
    // }
    //------------------------------
    // RdoSyncableCollectionNW
    //------------------------------
    executePatchOperations(patchOperations) {
        // Loop through and execute (note, the operations are in descending order by index
        for (const patchOp of patchOperations) {
            // EXECUTE
            switch (patchOp.op) {
                case 'add':
                    this.value.patchAdd(patchOp);
                    // If primitive, break. Else, fall through to update, so the values sync to the new item
                    if (__1.NodeTypeUtils.isPrimitive(patchOp.rdo))
                        break;
                case 'update':
                    if (!patchOp.rdo)
                        throw new Error('Rdo must not be null for patch-update operations');
                    this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemValue: patchOp.rdo, rdoNodeItemKey: patchOp.key, sourceNodeItemKey: patchOp.key });
                    break;
                case 'delete':
                    this.value.patchDelete(patchOp);
                    break;
                default:
                    throw new Error(`Unknown operation: ${patchOp.op}`);
                    break;
            }
            // PUBLISH
            this.eventEmitter.publish('nodeChange', {
                changeType: patchOp.op,
                sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath,
                sourceKey: patchOp.key,
                rdoKey: patchOp.key,
                previousSourceValue: patchOp.previousSourceValue,
                newSourceValue: patchOp.newSourceValue,
            });
        }
    }
}
exports.RdoSyncableCollectionNW = RdoSyncableCollectionNW;
//# sourceMappingURL=rdo-synchable-collection-nw.js.map