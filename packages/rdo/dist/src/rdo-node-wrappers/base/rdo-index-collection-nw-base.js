"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoIndexCollectionNWBase = void 0;
const logger_1 = require("../../infrastructure/logger");
const rdo_collection_nw_base_1 = require("./rdo-collection-nw-base");
const logger = logger_1.Logger.make('RdoCollectionNWBase');
class RdoIndexCollectionNWBase extends rdo_collection_nw_base_1.RdoCollectionNWBase {
    constructor({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }) {
        super({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
    }
    //------------------------------
    // Protected
    //------------------------------
    get last() {
        let mutableNodeCacheItem = this.mutableNodeCache.get({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath, dataKey: 'RdoIndexCollectionNWBase' });
        if (!mutableNodeCacheItem) {
            mutableNodeCacheItem = { sourceArray: new Array(), keyByIndexMap: new Map(), rdoByIndexMap: new Map(), indexByKeyMap: new Map() };
            this.mutableNodeCache.set({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath, dataKey: 'RdoIndexCollectionNWBase', data: mutableNodeCacheItem });
        }
        return mutableNodeCacheItem;
    }
    //------------------------------
    // Public
    //------------------------------
    smartSync() {
        //
        // Setup
        let changed = false;
        const wrappedSourceNode = this.wrappedSourceNode;
        const next = {
            sourceArray: wrappedSourceNode.elements(),
            keyByIndexMap: new Map(),
            indexByKeyMap: new Map(),
            rdoByIndexMap: new Map(),
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
            next.keyByIndexMap.set(i, elementKey);
            if (!next.indexByKeyMap.has(elementKey))
                next.indexByKeyMap.set(elementKey, i);
            // ---------------------------
            // New Index - ADD
            // ---------------------------
            // If index is not in previous source array, but in new source array. (In new source array by virtue of the fact we are looping here in the first place)
            if (this.last.keyByIndexMap.has(i)) {
                // EXECUTE
                const newRdo = this.makeRdoElement(nextSourceElement);
                changed = this.handleAddElement({ addHandler: this.onNewIndex, index, elementKey, newRdo, newSourceElement: nextSourceElement }) && changed;
                // Tracking
                next.rdoByIndexMap.set(i, newRdo);
                indexOffset++;
                next.sourceArray.push(nextSourceElement);
                // If index is in previous source array
            }
            else {
                const lastRdo = this.last.sourceArray[i];
                if (this.equalityComparer(lastRdo, nextSourceElement)) {
                    // No change, no patch needed. Just update map
                    next.rdoByIndexMap.set(i, this.last.rdoByIndexMap.get(index));
                }
                else {
                    // ---------------------------
                    // REPLACE or UPDATE
                    // ---------------------------
                    const result = this.handleReplaceOrUpdate({ replaceHandler: this.onReplaceIndex, index, elementKey, lastRdo, newSourceElement: nextSourceElement, previousSourceElement: lastSourceElement });
                    // Update map
                    next.rdoByIndexMap.set(i, result.nextRdo);
                }
            }
        }
        if (this.last.sourceArray.length > next.sourceArray.length) {
            // ---------------------------
            // Missing Index - DELETE
            // ---------------------------
            for (let i = next.sourceArray.length; i < this.last.sourceArray.length; i++) {
                const index = i + indexOffset;
                const previousSourceElement = this.last.sourceArray[i];
                const elementKey = this.last.keyByIndexMap.get(i);
                const rdoToDelete = this.last.rdoByIndexMap.get(i);
                changed = this.handleDeleteElement({ deleteHandler: this.onDeleteIndex, index, elementKey, rdoToDelete, previousSourceElement }) && changed;
            }
        }
        // Update nodeInstanceCache
        this.last.sourceArray = next.sourceArray;
        this.last.keyByIndexMap = next.keyByIndexMap;
        this.last.indexByKeyMap = next.indexByKeyMap;
        this.last.rdoByIndexMap = next.rdoByIndexMap;
        return changed;
    }
    getSourceNodeKeys() {
        return this.last.indexByKeyMap.keys();
    }
    getSourceNodeItem(key) {
        const index = this.last.indexByKeyMap.get(key);
        if (!index)
            return;
        return this.last.sourceArray[index];
    }
}
exports.RdoIndexCollectionNWBase = RdoIndexCollectionNWBase;
//# sourceMappingURL=rdo-index-collection-nw-base.js.map