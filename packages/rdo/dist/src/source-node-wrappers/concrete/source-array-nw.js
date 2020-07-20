"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceArrayNW = void 0;
const __1 = require("../..");
const types_1 = require("../../types");
const source_base_nw_1 = require("../base/source-base-nw");
class SourceArrayNW extends source_base_nw_1.SourceBaseNW {
    // /**
    //  *
    //  *
    //  * @readonly
    //  * @memberof SourceArrayNW
    //  * @description Returns map of element indexes by key. Note that if elements with duplicate keys are present in the source array, the first index with the corresponding key will be in the Map
    //  */
    // public get mapOfIndexByKey() {
    //   if (!this._mapOfIndexByKey) this.initializeMaps();
    //   return this._mapOfIndexByKey!;
    // }
    // private _mapOfIndexByKey: Map<K, number> | undefined;
    // /**
    //  *
    //  *
    //  * @readonly
    //  * @memberof SourceArrayNW
    //  * @description Returns map of elements by key. Note that if elements with duplicate keys are present in the source array, the first element with the corresponding key will be in the Map
    //  */
    // public get mapOfElementByKey() {
    //   if (!this._mapOfElementByKey) this.initializeMaps();
    //   return this._mapOfElementByKey!;
    // }
    // private _mapOfElementByKey: Map<K, S> | undefined;
    constructor({ value, sourceNodeTypePath, sourceNodeInstancePath, key, typeInfo, matchingNodeOptions, globalNodeOptions, }) {
        super({ sourceNodeTypePath, sourceNodeInstancePath, key, typeInfo, matchingNodeOptions, globalNodeOptions });
        //------------------------------
        // ISourceCollectionNodeWrapper
        //------------------------------
        this.makeCollectionKey = (item, index) => {
            var _a, _b;
            if (item === null || item === undefined)
                throw new Error(`Can not make collection key from null or undefined source object`);
            if ((_b = (_a = this.matchingNodeOptions) === null || _a === void 0 ? void 0 : _a.makeRdoCollectionKey) === null || _b === void 0 ? void 0 : _b.fromSourceElement) {
                // Use IMakeCollectionKey provided on options if available
                return this.matchingNodeOptions.makeRdoCollectionKey.fromSourceElement(item);
            }
            if (types_1.isITryMakeCollectionKey(this.wrappedRdoNode)) {
                const key = this.wrappedRdoNode.value.tryMakeKeyFromSourceElement(item);
                if (key !== undefined)
                    return key;
            }
            // Last option - look for idKey
            if (item[__1.config.defaultIdKey]) {
                return item[__1.config.defaultIdKey];
            }
            // If item is primitive, use that as key
            if (__1.NodeTypeUtils.isPrimitive(item)) {
                return item;
            }
            // If no key here, just use index
            return index;
        };
        this._value = value.filter((element) => element !== null && element !== undefined);
    }
    // //------------------------------
    // // Private
    // //------------------------------
    // private initializeMaps() {
    //   this._mapOfElementByKey = new Map<K, S>();
    //   this._mapOfIndexByKey = new Map<K, number>();
    //   for (let i = 0; i < this.value.length; i++) {
    //     const newElementKey = this.makeCollectionKey(this.value[i], i);
    //     if (!this._mapOfElementByKey.has(newElementKey)) {
    //       this._mapOfElementByKey.set(newElementKey, this.value[i]);
    //       this._mapOfIndexByKey.set(newElementKey, i);
    //     }
    //   }
    // }
    //------------------------------
    // ISourceNodeWrapper
    //------------------------------
    get value() {
        return this._value;
    }
    childElementCount() {
        return this._value.length;
    }
    //------------------------------
    // ISourceInternalNodeWrapper
    //------------------------------
    getNode() {
        return this._value;
    }
    elements() {
        return this._value;
    }
}
exports.SourceArrayNW = SourceArrayNW;
//# sourceMappingURL=source-array-nw.js.map