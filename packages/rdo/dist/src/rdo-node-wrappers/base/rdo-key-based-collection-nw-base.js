"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoKeyCollectionNWBase = void 0;
const tslib_1 = require("tslib");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const logger_1 = require("../../infrastructure/logger");
const rdo_collection_nw_base_1 = require("./rdo-collection-nw-base");
const logger = logger_1.Logger.make('RdoCollectionNWBase');
class RdoKeyCollectionNWBase extends rdo_collection_nw_base_1.RdoCollectionNWBase {
    constructor({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }) {
        super({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
    }
    //------------------------------
    // Protected
    //------------------------------
    get last() {
        let mutableNodeCacheItem = this.mutableNodeCache.get({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath, dataKey: 'RdoIndexCollectionNWBase' });
        if (!mutableNodeCacheItem) {
            mutableNodeCacheItem = { sourceArray: new Array(), sourceByKeyMap: new Map(), rdoByKeyMap: new Map() };
            this.mutableNodeCache.set({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath, dataKey: 'RdoIndexCollectionNWBase', data: mutableNodeCacheItem });
        }
        return mutableNodeCacheItem;
    }
    /** */
    smartSync() {
        //
        // Setup
        let changed = false;
        const wrappedSourceNode = this.wrappedSourceNode;
        const next = {
            sourceArray: wrappedSourceNode.elements(),
            sourceByKeyMap: new Map(),
            rdoByKeyMap: new Map(),
        };
        //
        // Loop and execute
        let indexOffset = 0;
        for (let i = 0; i < wrappedSourceNode.childElementCount(); i++) {
            // SETUP
            const lastSourceElement = this.last.sourceArray[i];
            const nextSourceElement = next.sourceArray[i];
            const index = i + indexOffset;
            const elementKey = wrappedSourceNode.makeCollectionKey(nextSourceElement, i);
            // Update maps
            next.sourceByKeyMap.set(elementKey, nextSourceElement);
            if (next.rdoByKeyMap.has(elementKey))
                continue; // If we have already seen the key, no need to add/update
            // ---------------------------
            // New Index - ADD
            // ---------------------------
            // If index is not in previous source array, but in new source array
            if (this.last.rdoByKeyMap.has(elementKey)) {
                // EXECUTE
                const newRdo = this.makeRdoElement(nextSourceElement);
                changed = this.handleAddElement({ addHandler: this.onNewKey, index, elementKey, newRdo, newSourceElement: nextSourceElement }) && changed;
                // Tracking
                next.rdoByKeyMap.set(elementKey, newRdo);
                indexOffset++;
                next.sourceArray.push(nextSourceElement);
                // If index is in previous source array
            }
            else {
                const lastRdo = this.last.rdoByKeyMap.get(elementKey);
                if (this.equalityComparer(lastRdo, nextSourceElement)) {
                    // No change, no patch needed
                }
                else {
                    // ---------------------------
                    // REPLACE or UPDATE
                    // ---------------------------
                    const result = this.handleReplaceOrUpdate({ replaceHandler: this.onReplaceKey, index, elementKey, lastRdo, newSourceElement: nextSourceElement, previousSourceElement: lastSourceElement });
                    // Update map
                    next.rdoByKeyMap.set(elementKey, result.nextRdo);
                }
            }
        }
        const nextKeys = Array.from(next.rdoByKeyMap.keys());
        const lastKeys = Array.from(this.last.rdoByKeyMap.keys());
        const missingKeys = lodash_1.default.difference(lastKeys, nextKeys);
        if (missingKeys.length > 0) {
            // ---------------------------
            // Missing Index - DELETE
            // ---------------------------
            for (const elementKey of missingKeys) {
                const previousSourceElement = this.last.sourceByKeyMap.get(elementKey);
                const rdoToDelete = this.last.rdoByKeyMap.get(elementKey);
                changed = this.handleDeleteElement({ deleteHandler: this.onDeleteKey, index: undefined, elementKey, rdoToDelete, previousSourceElement }) && changed;
            }
        }
        // Update nodeInstanceCache
        this.last.sourceArray = next.sourceArray;
        this.last.sourceByKeyMap = next.sourceByKeyMap;
        this.last.rdoByKeyMap = next.rdoByKeyMap;
        return changed;
    }
    getSourceNodeKeys() {
        return this.last.sourceByKeyMap.keys();
    }
    getSourceNodeItem(key) {
        return this.last.sourceByKeyMap.get(key);
    }
}
exports.RdoKeyCollectionNWBase = RdoKeyCollectionNWBase;
//# sourceMappingURL=rdo-key-based-collection-nw-base.js.map