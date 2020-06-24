"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoMapNW = void 0;
const __1 = require("..");
const logger_1 = require("../../infrastructure/logger");
const logger = logger_1.Logger.make('RdoMapNW');
class RdoMapNW extends __1.RdoCollectionNWBase {
    constructor({ value, typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, defaultEqualityComparer, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }) {
        super({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
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
    //   return this._value.keys();
    // }
    // public getItem(key: K) {
    //   return this._value.get(key);
    // }
    // public updateItem(key: K, value: D) {
    //   if (this._value.has(key)) {
    //     this._value.set(key, value);
    //     return true;
    //   } else return false;
    // }
    // public insertItem(key: K, value: D) {
    //   this._value.set(key, value);
    // }
    //------------------------------
    // IRdoInternalNodeWrapper
    //------------------------------
    // public smartSync(): boolean {
    //   if (this.wrappedSourceNode.childElementCount() === 0 && this.childElementCount() > 0) {
    //     return this.clearElements();
    //   } else {
    //     // Validate
    //     if (!isISourceCollectionNodeWrapper(this.wrappedSourceNode)) throw new Error(`RDO collection nodes can only be synced with Source collection nodes (Path: '${this.wrappedSourceNode.sourceNodeTypePath}'`);
    //     // Execute
    //     return super.synchronizeCollection();
    //   }
    // }
    //------------------------------
    // IRdoCollectionNodeWrapper
    //------------------------------
    elements() {
        return this._value.values();
    }
    childElementCount() {
        return this._value.size;
    }
    // public deleteElement(key: K): D | undefined {
    //   const item = this._value.get(key);
    //   this._value.delete(key);
    //   return item;
    // }
    // public clearElements(): boolean {
    //   if (this.childElementCount() === 0) return false;
    //   this._value.clear();
    //   return true;
    // }
    //------------------------------
    // RdoSyncableCollectionNW
    //------------------------------
    executePatchOperations(patchOperations) {
        // Loop through and execute (note, the operations are in descending order by index
        // EXECUTE
        for (const patchOp of patchOperations) {
            switch (patchOp.op) {
                case 'add':
                    if (!patchOp.rdo)
                        throw new Error(`Rdo must not be null for patch-add operations - sourceNodeTypePath:${this.wrappedSourceNode.sourceNodeTypePath},  Key:${patchOp.key}`);
                    this.value.set(patchOp.key, patchOp.rdo);
                    // If primitive, break. Else, fall through to update, so the values sync to the new item
                    if (__1.NodeTypeUtils.isPrimitive(patchOp.rdo))
                        break;
                case 'update':
                    if (!patchOp.rdo)
                        throw new Error('Rdo must not be null for patch-update operations');
                    this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemValue: patchOp.rdo, rdoNodeItemKey: patchOp.key, sourceNodeItemKey: patchOp.key });
                    break;
                case 'delete':
                    this.value.delete(patchOp.key);
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
exports.RdoMapNW = RdoMapNW;
//# sourceMappingURL=rdo-map-nw.js.map