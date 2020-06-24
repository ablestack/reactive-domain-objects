"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoSetNW = void 0;
const __1 = require("..");
const logger_1 = require("../../infrastructure/logger");
const logger = logger_1.Logger.make('RdoSetNW');
class RdoSetNW extends __1.RdoCollectionNWBase {
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
    //   if (this.childElementCount() === 0) return [];
    //   return CollectionUtils.Set.getCollectionKeys({ collection: this._value, makeCollectionKey: this.makeCollectionKey });
    // }
    // public getItem(key: K) {
    //   if (this.childElementCount() === 0) return undefined;
    //   return CollectionUtils.Set.getElement({ collection: this._value, makeCollectionKey: this.makeCollectionKey!, key });
    // }
    // public updateItem(key: K, value: D) {
    //   if (this.childElementCount() === 0) return false;
    //   return CollectionUtils.Set.updateElement<K, D>({ collection: this._value, makeCollectionKey: this.makeCollectionKey, value });
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
    // public insertItem(key: K, value: D) {
    //   CollectionUtils.Set.insertElement({ collection: this._value, key, value });
    // }
    // public deleteElement(key: K): D | undefined {
    //   return CollectionUtils.Set.deleteElement({ collection: this._value, makeCollectionKey: this.makeCollectionKey, key });
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
        for (const patchOp of patchOperations) {
            // EXECUTE
            switch (patchOp.op) {
                case 'add':
                    if (!patchOp.rdo)
                        throw new Error('Rdo must not be null for patch-add operations');
                    this.value.add(patchOp.rdo);
                // now fall through to update, so the values sync to the new item
                case 'update':
                    if (!patchOp.rdo)
                        throw new Error('Rdo must not be null for patch-update operations');
                    this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemValue: patchOp.rdo, rdoNodeItemKey: patchOp.key, sourceNodeItemKey: patchOp.key });
                    break;
                case 'delete':
                    if (!patchOp.rdo)
                        throw new Error('Rdo must not be null for Set patch-delete operations');
                    this.value.delete(patchOp.rdo);
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
exports.RdoSetNW = RdoSetNW;
//# sourceMappingURL=rdo-set-nw.js.map