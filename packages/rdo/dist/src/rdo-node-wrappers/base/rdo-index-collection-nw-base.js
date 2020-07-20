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
    get views() {
        let mutableNodeCacheItem = this.mutableNodeCache.get({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath, dataKey: 'RdoIndexCollectionNWBase' });
        if (!mutableNodeCacheItem) {
            mutableNodeCacheItem = { sourceArray: new Array(), keyByIndexMap: new Map(), rdoByIndexMap: new Map() };
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
        const last = {
            sourceArray: this.views.sourceArray,
            keyByIndexMap: this.views.keyByIndexMap,
            rdoByIndexMap: this.views.rdoByIndexMap,
        };
        this.views.sourceArray = wrappedSourceNode.elements();
        this.views.keyByIndexMap = new Map();
        this.views.rdoByIndexMap = new Map();
        //
        // Loop and execute
        let indexOffset = 0;
        for (let i = 0; i < wrappedSourceNode.childElementCount(); i++) {
            // SETUP
            const nextSourceElement = this.views.sourceArray[i];
            const index = i + indexOffset;
            // Update maps
            const elementKey = wrappedSourceNode.makeCollectionKey(nextSourceElement, i);
            this.views.keyByIndexMap.set(i, elementKey);
            // ---------------------------
            // New Index - ADD
            // ---------------------------
            // If rdo not in previous, add
            if (!last.rdoByIndexMap.has(i)) {
                // EXECUTE
                const newRdo = this.makeRdoElement(nextSourceElement);
                // Tracking
                this.views.rdoByIndexMap.set(i, newRdo);
                indexOffset++;
                // Handle
                changed = this.handleAddElement({ addHandler: this.onNewIndex, index, collectionKey: i, newRdo, newSourceElement: nextSourceElement }) && changed;
                // If index is in previous source array
            }
            else {
                const lastSourceElement = last.sourceArray[i];
                if (this.equalityComparer(lastSourceElement, nextSourceElement)) {
                    // No change, no patch needed. Just update view
                    this.views.rdoByIndexMap.set(i, last.rdoByIndexMap.get(index));
                }
                else {
                    // ---------------------------
                    // REPLACE or UPDATE
                    // ---------------------------
                    // Tracking
                    const lastRdo = last.rdoByIndexMap.get(i);
                    this.views.rdoByIndexMap.set(i, lastRdo);
                    // Handle
                    const lastElementKey = last.keyByIndexMap.get(i);
                    const result = this.handleReplaceOrUpdate({
                        replaceHandler: this.onReplaceIndex,
                        index,
                        collectionKey: i,
                        lastElementKey,
                        nextElementKey: elementKey,
                        lastRdo: lastSourceElement,
                        newSourceElement: nextSourceElement,
                        previousSourceElement: lastSourceElement,
                    });
                    // Add result in case element replaced
                    this.views.rdoByIndexMap.set(i, result.nextRdo);
                }
            }
        }
        if (last.sourceArray.length > this.views.sourceArray.length) {
            // ---------------------------
            // Missing Index - DELETE
            // ---------------------------
            for (let i = this.views.sourceArray.length; i < last.sourceArray.length; i++) {
                const index = i + indexOffset;
                const previousSourceElement = last.sourceArray[i];
                const rdoToDelete = last.rdoByIndexMap.get(i);
                // Handle
                changed = this.handleDeleteElement({ deleteHandler: this.onDeleteIndex, index, collectionKey: i, rdoToDelete, previousSourceElement }) && changed;
            }
        }
        // Update nodeInstanceCache
        last.sourceArray = this.views.sourceArray;
        last.rdoByIndexMap = this.views.rdoByIndexMap;
        return changed;
    }
    getSourceNodeKeys() {
        return this.views.sourceArray.keys();
    }
    getSourceNodeItem(key) {
        return this.views.sourceArray[key];
    }
    getRdoNodeItem(key) {
        return this.views.rdoByIndexMap.get(key);
    }
}
exports.RdoIndexCollectionNWBase = RdoIndexCollectionNWBase;
//# sourceMappingURL=rdo-index-collection-nw-base.js.map