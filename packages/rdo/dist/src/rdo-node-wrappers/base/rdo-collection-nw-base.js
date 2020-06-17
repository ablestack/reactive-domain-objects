"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoCollectionNWBase = void 0;
const __1 = require("../..");
const logger_1 = require("../../infrastructure/logger");
const rdo_internal_nw_base_1 = require("./rdo-internal-nw-base");
const node_type_utils_1 = require("../utils/node-type.utils");
const types_1 = require("../../types");
const mobx_1 = require("mobx");
const logger = logger_1.Logger.make('RdoCollectionNWBase');
class RdoCollectionNWBase extends rdo_internal_nw_base_1.RdoInternalNWBase {
    constructor({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, }) {
        super({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray });
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
            var _a, _b, _c;
            // Use IMakeCollectionKey provided on options if available
            if ((_b = (_a = this.getNodeOptions()) === null || _a === void 0 ? void 0 : _a.makeRdoCollectionKey) === null || _b === void 0 ? void 0 : _b.fromRdoElement) {
                return this.getNodeOptions().makeRdoCollectionKey.fromRdoElement(item);
            }
            if (types_1.isIMakeCollectionKeyFromRdoElement(this.value)) {
                return this.value.makeCollectionKeyFromRdoElement(item);
            }
            // If primitive, the item is the key
            if (node_type_utils_1.NodeTypeUtils.isPrimitive(item)) {
                return String(item);
            }
            // Look for idKey
            if (__1.config.defaultIdKey in item) {
                return item[__1.config.defaultIdKey];
            }
            // Look for idKey with common postfix
            if ((_c = this.globalNodeOptions) === null || _c === void 0 ? void 0 : _c.commonRdoFieldnamePostfix) {
                const defaultIdKeyWithPostfix = `${__1.config.defaultIdKey}${this.globalNodeOptions.commonRdoFieldnamePostfix}`;
                if (defaultIdKeyWithPostfix in item) {
                    return item[defaultIdKeyWithPostfix];
                }
            }
            throw new Error(`Path: ${this.wrappedSourceNode.sourceNodePath} - could not find makeKeyFromRdoElement implementation either via config or interface. See documentation for details`);
        };
    }
    makeRdoElement(sourceObject) {
        var _a, _b, _c, _d, _e, _f;
        let rdo = undefined;
        console.log(`${this.wrappedSourceNode.sourceNodePath} - this.getNodeOptions()`, this.getNodeOptions(), (_a = this.getNodeOptions()) === null || _a === void 0 ? void 0 : _a.makeRdo, this.wrappedSourceNode.value);
        if ((_b = this.getNodeOptions()) === null || _b === void 0 ? void 0 : _b.makeRdo) {
            rdo = this.getNodeOptions().makeRdo(sourceObject, this);
        }
        if (!rdo && types_1.isIMakeRdo(this.value)) {
            rdo = this.value.makeRdo(sourceObject, this);
        }
        if (!rdo && ((_c = this.globalNodeOptions) === null || _c === void 0 ? void 0 : _c.makeRdo)) {
            return this.globalNodeOptions.makeRdo(sourceObject, this);
        }
        if (!rdo && ((_d = this.globalNodeOptions) === null || _d === void 0 ? void 0 : _d.makeRdo)) {
            return this.globalNodeOptions.makeRdo(sourceObject, this);
        }
        // Auto-create Rdo collectionItem if autoInstantiateRdoItems.collectionItemsAsObservableObjectLiterals
        // Note: this uses MobX to create an observable tree in the exact shape
        // of the source data, regardless of original TypeScript typing of the collection items
        // It is recommended to consistently use autoMakeRdo* OR consistently provide customMakeRdo methods
        // Blending both can lead to unexpected behavior
        if (!rdo && ((_f = (_e = this.globalNodeOptions) === null || _e === void 0 ? void 0 : _e.autoInstantiateRdoItems) === null || _f === void 0 ? void 0 : _f.collectionItemsAsObservableObjectLiterals)) {
            rdo = mobx_1.observable(sourceObject);
        }
        return rdo;
    }
}
exports.RdoCollectionNWBase = RdoCollectionNWBase;
//# sourceMappingURL=rdo-collection-nw-base.js.map