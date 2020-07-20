"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoArrayNW = void 0;
const logger_1 = require("../../infrastructure/logger");
const rdo_index_collection_nw_base_1 = require("../base/rdo-index-collection-nw-base");
const logger = logger_1.Logger.make('RdoArrayNW');
class RdoArrayNW extends rdo_index_collection_nw_base_1.RdoIndexCollectionNWBase {
    constructor({ value, typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }) {
        super({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
        //------------------------------
        // RdoIndexCollectionNWBase
        //------------------------------
        this.onNewIndex = ({ index, key, nextRdo }) => {
            if (index === null || index === undefined)
                throw new Error('Index can not be null or undefined for index based collection operations');
            this.value.splice(index, 0, nextRdo);
            return true;
        };
        this.onReplaceIndex = ({ index, key, lastRdo, nextRdo }) => {
            if (index === null || index === undefined)
                throw new Error('Index can not be null or undefined for index based collection operations');
            this.value.splice(index, 1, nextRdo);
            return true;
        };
        this.onDeleteIndex = ({ index, key, lastRdo }) => {
            if (index === null || index === undefined)
                throw new Error('Index can not be null or undefined for index based collection operations');
            this.value.splice(index, 1);
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
        return this._value;
    }
    childElementCount() {
        return this._value.length;
    }
}
exports.RdoArrayNW = RdoArrayNW;
//# sourceMappingURL=rdo-array-nw.js.map