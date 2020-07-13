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
    // Private
    //------------------------------
    getNodeInstanceCache() {
        let mutableNodeCacheItem = this.mutableNodeCache.get({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath });
        if (!mutableNodeCacheItem) {
            mutableNodeCacheItem = { sourceData: new Array(), rdoMap: new Map() };
            this.mutableNodeCache.set({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath, data: mutableNodeCacheItem });
        }
        return mutableNodeCacheItem;
    }
    //------------------------------
    // IRdoNodeWrapper
    //------------------------------
    get isLeafNode() {
        return false;
    }
    get value() {
        return this._value;
    }
    //------------------------------
    // IRdoInternalNodeWrapper
    //------------------------------
    getItem(key) {
        return this.value.getItem(key);
    }
    //------------------------------
    // IRdoCollectionNodeWrapper
    //------------------------------
    elements() {
        return this._value.elements();
    }
    childElementCount() {
        return this._value.size;
    }
    //------------------------------
    // RdoSyncableCollectionNW
    //------------------------------
    // protected sync() {
    //   //TODO
    //   //this.value.sync({ wrappedRdoNode: this, equalityComparer: this.equalityComparer, eventEmitter: this.eventEmitter, syncChildNode: this.syncChildNode });
    // }
    getSourceNodeKeys() {
        //TODO
        //this.value.getSourceNodeKeys();
        return [];
    }
    getSourceNodeItem(key) {
        return this.value.getItem(key);
    }
    smartSync() {
        //TODO
        return false;
    }
}
exports.RdoSyncableCollectionNW = RdoSyncableCollectionNW;
//# sourceMappingURL=rdo-synchable-collection-nw.js.map