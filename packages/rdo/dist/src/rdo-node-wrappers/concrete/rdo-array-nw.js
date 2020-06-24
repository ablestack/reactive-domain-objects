"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoArrayNW = void 0;
const __1 = require("..");
const logger_1 = require("../../infrastructure/logger");
const logger = logger_1.Logger.make('RdoArrayNW');
class RdoArrayNW extends __1.RdoCollectionNWBase {
    constructor({ value, typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }) {
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
    //   if (this.childElementCount() === 0) return [];
    //   return CollectionUtils.Array.getCollectionKeys({ collection: this._value, makeCollectionKey: this.makeCollectionKey });
    // }
    // public getItem(key: string) {
    //   if (this.childElementCount() === 0) return undefined;
    //   const item = CollectionUtils.Array.getElement({ collection: this._value, makeCollectionKey: this.makeCollectionKey, key });
    //   return item;
    // }
    // public updateItem(key: string, value: D) {
    //   if (this.childElementCount() === 0) return false;
    //   return CollectionUtils.Array.updateElement({ collection: this._value, makeCollectionKey: this.makeCollectionKey, value });
    // }
    // public insertItem(key: string, value: D) {
    //   CollectionUtils.Array.insertElement({ collection: this._value, key, value });
    // }
    //------------------------------
    // IRdoInternalNodeWrapper
    //------------------------------
    // public smartSync(): boolean {
    //   if (this.wrappedSourceNode.childElementCount() === 0 && this.childElementCount() > 0) {
    //     return this.clearElements();
    //   } else {
    //     RdoWrapperValidationUtils.nonKeyedCollectionSizeCheck({ sourceNodePath: this.wrappedSourceNode.sourceNodePath, collectionSize: this.childElementCount(), collectionType: this.typeInfo.builtInType });
    //     if (!isISourceCollectionNodeWrapper(this.wrappedSourceNode)) throw new Error(`RDO collection nodes can only be synced with Source collection nodes (Path: '${this.wrappedSourceNode.sourceNodePath}'`);
    //     // Execute
    //     const changed = super.synchronizeCollection();
    //     return changed;
    //   }
    // }
    //------------------------------
    // IRdoCollectionNodeWrapper
    //------------------------------
    elements() {
        return this._value;
    }
    childElementCount() {
        return this._value.length;
    }
    // public deleteElement(key: string): D | undefined {
    //   return CollectionUtils.Array.deleteElement({ collection: this._value, makeCollectionKey: this.makeCollectionKey, key });
    // }
    // public clearElements(): boolean {
    //   return CollectionUtils.Array.clear({ collection: this._value });
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
                    if (!patchOp.rdo)
                        throw new Error('Rdo must not be null for patch-add operations');
                    this.value.splice(patchOp.index, 0, patchOp.rdo);
                // now fall through to update, so the values sync to the new item
                case 'update':
                    if (!patchOp.rdo)
                        throw new Error('Rdo must not be null for patch-update operations');
                    this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemValue: patchOp.rdo, rdoNodeItemKey: patchOp.key, sourceNodeItemKey: patchOp.key });
                    break;
                case 'delete':
                    this.value.splice(patchOp.index, 1);
                    break;
                default:
                    throw new Error(`Unknown operation: ${patchOp.op}`);
                    break;
            }
            // PUBLISH
            this.eventEmitter.publish('nodeChange', {
                changeType: patchOp.op,
                sourceNodePath: this.wrappedSourceNode.sourceNodePath,
                sourceKey: patchOp.key,
                rdoKey: patchOp.key,
                previousSourceValue: patchOp.previousSourceValue,
                newSourceValue: patchOp.newSourceValue,
            });
        }
    }
}
exports.RdoArrayNW = RdoArrayNW;
//# sourceMappingURL=rdo-array-nw.js.map