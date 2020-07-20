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
    get views() {
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
        const last = {
            sourceArray: this.views.sourceArray,
            sourceByKeyMap: this.views.sourceByKeyMap,
            rdoByKeyMap: this.views.rdoByKeyMap,
        };
        this.views.sourceArray = wrappedSourceNode.elements();
        this.views.sourceByKeyMap = new Map();
        this.views.rdoByKeyMap = new Map();
        //
        // Loop and execute
        let indexOffset = 0;
        for (let i = 0; i < wrappedSourceNode.childElementCount(); i++) {
            // SETUP
            const nextSourceElement = this.views.sourceArray[i];
            const index = i + indexOffset;
            const elementKey = wrappedSourceNode.makeCollectionKey(nextSourceElement, i);
            // Update maps
            if (this.views.sourceByKeyMap.has(elementKey))
                continue; // If we have already seen the key, no need to add/update
            this.views.sourceByKeyMap.set(elementKey, nextSourceElement);
            // ---------------------------
            // New key - ADD
            // ---------------------------
            // If rdo not in previous, add
            if (!last.rdoByKeyMap.has(elementKey)) {
                // EXECUTE
                const newRdo = this.makeRdoElement(nextSourceElement);
                // Tracking
                this.views.rdoByKeyMap.set(elementKey, newRdo);
                indexOffset++;
                // Handle
                changed = this.handleAddElement({ addHandler: this.onNewKey, index, elementKey, newRdo, newSourceElement: nextSourceElement }) && changed;
                // If index is in previous source array
            }
            else {
                const lastSourceElement = last.sourceByKeyMap.get(elementKey);
                const lastRdo = last.rdoByKeyMap.get(elementKey);
                if (this.equalityComparer(lastSourceElement, nextSourceElement)) {
                    // No change, no patch needed. Just update view
                    const lastRdo = last.rdoByKeyMap.get(elementKey);
                    this.views.rdoByKeyMap.set(elementKey, lastRdo);
                }
                else {
                    // ---------------------------
                    // REPLACE or UPDATE
                    // ---------------------------
                    // Tracking
                    this.views.rdoByKeyMap.set(elementKey, lastRdo);
                    // Handle
                    const result = this.handleReplaceOrUpdate({ replaceHandler: this.onReplaceKey, index, elementKey, lastRdo, newSourceElement: nextSourceElement, previousSourceElement: lastSourceElement });
                    // Add result in case element replaced
                    this.views.rdoByKeyMap.set(elementKey, result.nextRdo);
                }
            }
        }
        const nextKeys = Array.from(this.views.rdoByKeyMap.keys());
        const lastKeys = Array.from(last.rdoByKeyMap.keys());
        const missingKeys = lodash_1.default.difference(lastKeys, nextKeys);
        if (missingKeys.length > 0) {
            // ---------------------------
            // Missing Index - DELETE
            // ---------------------------
            for (const elementKey of missingKeys) {
                const previousSourceElement = last.sourceByKeyMap.get(elementKey);
                const rdoToDelete = last.rdoByKeyMap.get(elementKey);
                changed = this.handleDeleteElement({ deleteHandler: this.onDeleteKey, index: undefined, elementKey, rdoToDelete, previousSourceElement }) && changed;
            }
        }
        return changed;
    }
    getSourceNodeKeys() {
        return this.views.sourceByKeyMap.keys();
    }
    getSourceNodeItem(key) {
        return this.views.sourceByKeyMap.get(key);
    }
    getRdoNodeItem(key) {
        return this.views.rdoByKeyMap.get(key);
    }
}
exports.RdoKeyCollectionNWBase = RdoKeyCollectionNWBase;
//# sourceMappingURL=rdo-key-based-collection-nw-base.js.map