"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoMapNW = void 0;
const logger_1 = require("../../infrastructure/logger");
const rdo_key_based_collection_nw_base_1 = require("../base/rdo-key-based-collection-nw-base");
const logger = logger_1.Logger.make('RdoMapNW');
class RdoMapNW extends rdo_key_based_collection_nw_base_1.RdoKeyCollectionNWBase {
    constructor({ value, typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, defaultEqualityComparer, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }) {
        super({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
        //------------------------------
        // RdoIndexCollectionNWBase
        //------------------------------
        this.onNewKey = ({ index, key, nextRdo }) => {
            this.value.set(key, nextRdo);
            return true;
        };
        this.onReplaceKey = ({ index, key, lastRdo, nextRdo }) => {
            this.value.set(key, nextRdo);
            return true;
        };
        this.onDeleteKey = ({ index, key, lastRdo }) => {
            this.value.delete(key);
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
exports.RdoMapNW = RdoMapNW;
//# sourceMappingURL=rdo-map-nw.js.map