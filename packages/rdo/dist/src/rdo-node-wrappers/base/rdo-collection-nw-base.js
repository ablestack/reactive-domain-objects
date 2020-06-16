"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoCollectionNWBase = void 0;
const __1 = require("../..");
const logger_1 = require("../../infrastructure/logger");
const rdo_internal_nw_base_1 = require("./rdo-internal-nw-base");
const node_type_utils_1 = require("../utils/node-type.utils");
const types_1 = require("../../types");
const logger = logger_1.Logger.make('RdoCollectionNWBase');
class RdoCollectionNWBase extends rdo_internal_nw_base_1.RdoInternalNWBase {
    constructor({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, }) {
        super({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions });
        //------------------------------
        // IRdoCollectionNodeWrapper
        //------------------------------
        // private _childElementSourceNodeKind: ChildElementsNodeKind | undefined = undefined;
        // public get childElementsNodeKind(): ChildElementsNodeKind {
        //   if (!this._childElementSourceNodeKind) {
        //     // Try and get element type from source collection
        //     const firstElement = this.elements()[Symbol.iterator]().next().value;
        //     if (firstElement) {
        //       this._childElementSourceNodeKind = NodeTypeUtils.getRdoNodeType(firstElement).kind;
        //     } else this._childElementSourceNodeKind = null;
        //   }
        //   return this._childElementSourceNodeKind;
        // }
        this.makeCollectionKey = (item) => {
            var _a, _b;
            // Use IMakeCollectionKey provided on options if available
            if ((_b = (_a = this.matchingNodeOptions) === null || _a === void 0 ? void 0 : _a.makeRdoCollectionKey) === null || _b === void 0 ? void 0 : _b.fromRdoElement) {
                return this.matchingNodeOptions.makeRdoCollectionKey.fromRdoElement(item);
            }
            if (types_1.isIMakeCollectionKeyFromRdoElement(this.value)) {
                return this.value.makeCollectionKeyFromRdoElement(item);
            }
            // If primitive, the item is the key
            if (node_type_utils_1.NodeTypeUtils.isPrimitive(item)) {
                return String(item);
            }
            // Last option - look for idKey
            if (item[__1.config.defaultIdKey]) {
                return item[__1.config.defaultIdKey];
            }
            throw new Error(`Path: ${this.wrappedSourceNode.sourceNodePath} - could not find makeKeyFromRdoElement implementation either via config or interface. See documentation for details`);
        };
    }
    makeRdo(sourceObject) {
        var _a;
        // Use IMakeCollectionKey provided on options if available
        if ((_a = this.matchingNodeOptions) === null || _a === void 0 ? void 0 : _a.makeRdo) {
            return this.matchingNodeOptions.makeRdo(sourceObject);
        }
        if (types_1.isIMakeRdo(this.value)) {
            return this.value.makeRdo(sourceObject);
        }
        return undefined;
    }
}
exports.RdoCollectionNWBase = RdoCollectionNWBase;
//# sourceMappingURL=rdo-collection-nw-base.js.map