"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceArrayNW = void 0;
const __1 = require("../..");
const collection_utils_1 = require("../../rdo-node-wrappers/utils/collection.utils");
const source_base_nw_1 = require("../base/source-base-nw");
const node_type_utils_1 = require("../../rdo-node-wrappers/utils/node-type.utils");
const types_1 = require("../../types");
class SourceArrayNW extends source_base_nw_1.SourceBaseNW {
    constructor({ value, sourceNodePath, key, typeInfo, lastSourceNode, matchingNodeOptions, globalNodeOptions, }) {
        super({ sourceNodePath, key, typeInfo, lastSourceNode, matchingNodeOptions, globalNodeOptions });
        this._value = value;
    }
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
    nodeKeys() {
        return collection_utils_1.CollectionUtils.Array.getCollectionKeys({ collection: this._value, makeCollectionKey: this.makeCollectionKey });
    }
    getItem(key) {
        return collection_utils_1.CollectionUtils.Array.getElement({ collection: this._value, makeCollectionKey: this.makeCollectionKey, key });
    }
    getNode() {
        return this._value;
    }
    //------------------------------
    // ISourceCollectionNodeWrapper
    //------------------------------
    // private _childElementsNodeKind: ChildElementsNodeKind | undefined;
    // public get ChildElementsNodeKind(): ChildElementsNodeKind {
    //   if (this._childElementsNodeKind === undefined) {
    //     const firstElement = this.elements()[Symbol.iterator]().next().value;
    //     if (firstElement) {
    //       this._childElementsNodeKind = NodeTypeUtils.getSourceNodeType(firstElement).kind;
    //     } else this._childElementsNodeKind = null;
    //   }
    //   return this._childElementsNodeKind;
    // }
    makeCollectionKey(item) {
        var _a, _b;
        // Use IMakeCollectionKey provided on options if available
        if ((_b = (_a = this.matchingNodeOptions) === null || _a === void 0 ? void 0 : _a.makeRdoCollectionKey) === null || _b === void 0 ? void 0 : _b.fromSourceElement) {
            return this.matchingNodeOptions.makeRdoCollectionKey.fromSourceElement(item);
        }
        if (types_1.isIMakeCollectionKeyFromSourceElement(this.wrappedRdoNode)) {
            return this.wrappedRdoNode.value.makeKeyFromSourceElement(item);
        }
        // If primitive, the item is the key
        if (node_type_utils_1.NodeTypeUtils.isPrimitive(item)) {
            return String(item);
        }
        // Last option - look for idKey
        if (item[__1.config.defaultIdKey]) {
            return item[__1.config.defaultIdKey];
        }
        return undefined;
    }
    elements() {
        return this._value;
    }
}
exports.SourceArrayNW = SourceArrayNW;
//# sourceMappingURL=source-array-nw.js.map