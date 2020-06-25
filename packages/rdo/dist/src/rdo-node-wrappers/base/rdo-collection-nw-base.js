"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoCollectionNWBase = void 0;
const logger_1 = require("../../infrastructure/logger");
const types_1 = require("../../types");
const global_utils_1 = require("../utils/global.utils");
const rdo_internal_nw_base_1 = require("./rdo-internal-nw-base");
const logger = logger_1.Logger.make('RdoCollectionNWBase');
class RdoCollectionNWBase extends rdo_internal_nw_base_1.RdoInternalNWBase {
    constructor({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }) {
        super({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
        this._equalityComparer = defaultEqualityComparer;
    }
    //------------------------------
    // Protected
    //------------------------------
    /** */
    getNodeInstanceCache() {
        let mutableNodeCacheItem = this.mutableNodeCache.get({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath });
        if (!mutableNodeCacheItem) {
            mutableNodeCacheItem = { sourceData: new Array(), rdoMap: new Map() };
            this.mutableNodeCache.set({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath, data: mutableNodeCacheItem });
        }
        return mutableNodeCacheItem;
    }
    /** */
    generatePatchOperations({ wrappedSourceNode, mutableNodeCacheItem }) {
        const operations = new Array();
        const origSourceArray = mutableNodeCacheItem.sourceData;
        const rdoMap = mutableNodeCacheItem.rdoMap;
        const newSourceArray = this.wrappedSourceNode.value;
        const count = Math.max(origSourceArray.length, newSourceArray.length);
        for (let i = 0; i <= count; i++) {
            const previousSourceElement = origSourceArray[i];
            const newSourceElement = newSourceArray[i];
            let op;
            if (global_utils_1.isNullOrUndefined(previousSourceElement) && !global_utils_1.isNullOrUndefined(newSourceElement)) {
                // ---------------------------
                // New Key
                // ---------------------------
                const newElementKey = wrappedSourceNode.makeCollectionKey(newSourceElement);
                const newRdo = this.makeRdoElement(newSourceElement);
                // Add operation
                operations.push({ op: 'add', index: i, key: newElementKey, previousSourceValue: previousSourceElement, newSourceValue: newSourceElement, rdo: newRdo });
                // Update Rdo Map
                rdoMap.set(newElementKey, newRdo);
            }
            else if (!global_utils_1.isNullOrUndefined(previousSourceElement) && !global_utils_1.isNullOrUndefined(newSourceElement)) {
                // ---------------------------
                // Existing Key
                // ---------------------------
                const origElementKey = wrappedSourceNode.makeCollectionKey(previousSourceElement);
                const newElementKey = wrappedSourceNode.makeCollectionKey(newSourceElement);
                if (origElementKey !== newElementKey) {
                    // ---------------------------
                    // Keys don't match
                    // ---------------------------
                    const origRdo = rdoMap.get(origElementKey);
                    if (!origRdo)
                        throw new Error(`Could not find original Rdo with key ${origElementKey}`);
                    const newRdo = this.makeRdoElement(newElementKey);
                    // Add operations
                    operations.push({ op: 'delete', index: i, key: origElementKey, previousSourceValue: previousSourceElement, newSourceValue: newSourceElement, rdo: origRdo });
                    operations.push({ op: 'add', index: i, key: newElementKey, previousSourceValue: previousSourceElement, newSourceValue: newSourceElement, rdo: newRdo });
                    // Update Rdo Map
                    rdoMap.delete(origElementKey);
                    rdoMap.set(newElementKey, newRdo);
                }
                else {
                    // ---------------------------
                    // Keys Match
                    // ---------------------------
                    if (this._equalityComparer(previousSourceElement, newSourceElement)) {
                        // No change, no patch needed
                    }
                    else {
                        // Add operations
                        operations.push({ op: 'update', index: i, key: origElementKey, previousSourceValue: previousSourceElement, newSourceValue: newSourceElement });
                        // Update Rdo Map
                        // No update needed
                    }
                }
            }
            else if (!global_utils_1.isNullOrUndefined(previousSourceElement) && global_utils_1.isNullOrUndefined(newSourceElement)) {
                // ---------------------------
                // Missing Key
                // ---------------------------
                const origElementKey = wrappedSourceNode.makeCollectionKey(previousSourceElement);
                const origRdo = rdoMap.get(origElementKey);
                if (!origRdo)
                    throw new Error(`Could not find original Rdo with key ${origElementKey}`);
                // Add operations
                operations.push({ op: 'delete', index: i, key: wrappedSourceNode.makeCollectionKey(previousSourceElement), previousSourceValue: previousSourceElement, newSourceValue: newSourceElement, rdo: origRdo });
                // Update Rdo Map
                rdoMap.delete(origElementKey);
            }
        }
        return operations;
    }
    /** */
    smartSync() {
        // Setup
        const mutableNodeCacheItem = this.getNodeInstanceCache();
        if (!types_1.isISourceCollectionNodeWrapper(this.wrappedSourceNode))
            throw new Error('Can only sync Rdo collection types with Collection source types');
        const patchOperations = this.generatePatchOperations({ wrappedSourceNode: this.wrappedSourceNode, mutableNodeCacheItem });
        if (this.key === 'mapOfNumbers') {
            console.log('patchOperations', patchOperations);
        }
        // Instrumentation
        //console.log(`synchronizeCollection - sourceNodeTypePath: ${this.wrappedSourceNode.sourceNodeTypePath} - prepared patch operations`, patchOperations);
        logger.trace(`synchronizeCollection - sourceNodeTypePath: ${this.wrappedSourceNode.sourceNodeTypePath} - prepared patch operations`, patchOperations);
        // Execute
        this.executePatchOperations(patchOperations);
        // Update cache
        mutableNodeCacheItem.sourceData = this.wrappedSourceNode.value;
        // Return
        return patchOperations.length > 0;
    }
}
exports.RdoCollectionNWBase = RdoCollectionNWBase;
//# sourceMappingURL=rdo-collection-nw-base.js.map