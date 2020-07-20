"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoSetNW = void 0;
const logger_1 = require("../../infrastructure/logger");
const rdo_key_based_collection_nw_base_1 = require("../base/rdo-key-based-collection-nw-base");
const logger = logger_1.Logger.make('RdoSetNW');
class RdoSetNW extends rdo_key_based_collection_nw_base_1.RdoKeyCollectionNWBase {
    constructor({ value, typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, defaultEqualityComparer, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }) {
        super({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, defaultEqualityComparer, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
        //------------------------------
        // RdoSyncableCollectionNW
        //------------------------------
        this.onNewKey = ({ index, key, nextRdo }) => {
            this.value.add(nextRdo);
            return true;
        };
        this.onReplaceKey = ({ index, key, lastRdo, nextRdo }) => {
            this.value.delete(lastRdo);
            this.value.add(nextRdo);
            return true;
        };
        this.onDeleteKey = ({ index, key, lastRdo }) => {
            this.value.delete(lastRdo);
            return true;
        };
        this._value = value;
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
    // IRdoCollectionNodeWrapper
    //------------------------------
    elements() {
        return this._value.values();
    }
    childElementCount() {
        return this._value.size;
    }
}
exports.RdoSetNW = RdoSetNW;
//# sourceMappingURL=rdo-set-nw.js.map