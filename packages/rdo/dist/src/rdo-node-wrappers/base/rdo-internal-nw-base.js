"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoInternalNWBase = void 0;
const logger_1 = require("../../infrastructure/logger");
const rdo_nw_base_1 = require("./rdo-nw-base");
const __1 = require("../..");
const mobx_1 = require("mobx");
const logger = logger_1.Logger.make('RdoMapNW');
class RdoInternalNWBase extends rdo_nw_base_1.RdoNWBase {
    constructor({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }) {
        super({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
        this._syncChildNode = syncChildNode;
    }
    //------------------------------
    // Protected
    //------------------------------
    get syncChildNode() {
        return this._syncChildNode;
    }
    //------------------------------
    // IRdoInternalNodeWrapper
    //------------------------------
    makeRdoElement(sourceObject) {
        var _a, _b, _c, _d;
        let rdo = undefined;
        if ((_a = this.getNodeOptions()) === null || _a === void 0 ? void 0 : _a.makeRdo) {
            rdo = this.getNodeOptions().makeRdo(sourceObject, this);
            logger.trace(`makeRdoElement - sourceNodeTypePath: ${this.wrappedSourceNode.sourceNodeTypePath} - making RDO from nodeOptions`, sourceObject, rdo);
        }
        if (!rdo && __1.isIMakeRdo(this.value)) {
            rdo = this.value.makeRdo(sourceObject, this);
            logger.trace(`makeRdoElement - sourceNodeTypePath: ${this.wrappedSourceNode.sourceNodeTypePath} - making RDO from IMakeRdo`, sourceObject, rdo);
        }
        if (!rdo && ((_b = this.globalNodeOptions) === null || _b === void 0 ? void 0 : _b.makeRdo)) {
            rdo = this.globalNodeOptions.makeRdo(sourceObject, this);
            logger.trace(`makeRdoElement - sourceNodeTypePath: ${this.wrappedSourceNode.sourceNodeTypePath} - making RDO from globalNodeOptions`, sourceObject, rdo);
        }
        if (!rdo && __1.NodeTypeUtils.isPrimitive(sourceObject)) {
            rdo = sourceObject;
            logger.trace(`makeRdoElement - sourceNodeTypePath: ${this.wrappedSourceNode.sourceNodeTypePath} - making RDO from primitive`, sourceObject, rdo);
        }
        // Auto-create Rdo object field if autoMakeRdoTypes.collectionElements
        // Note: this creates an observable tree in the exact shape of the source data
        // It is recommended to consistently use autoMakeRdo* OR consistently provide customMakeRdo methods. Blending both can lead to unexpected behavior
        // Keys made here, instantiation takes place in downstream constructors
        if (!rdo && ((_d = (_c = this.globalNodeOptions) === null || _c === void 0 ? void 0 : _c.autoMakeRdoTypes) === null || _d === void 0 ? void 0 : _d.collectionElements)) {
            if (this.globalNodeOptions.autoMakeRdoTypes.as === 'mobx-observable-object-literals') {
                rdo = this.autoInstantiateNodeAsMobxObservables(sourceObject);
            }
            else {
                this.autoInstantiateNodeAsPlainObjectLiterals(sourceObject);
            }
            logger.trace(`makeRdoElement - sourceNodeTypePath: ${this.wrappedSourceNode.sourceNodeTypePath} - making RDO from autoMakeRdoTypes`, sourceObject, rdo);
        }
        return rdo;
    }
    //------------------------------
    // Private
    //------------------------------
    // AUTO INSTANTIATE
    // Always return empty objects or collections, as these will get synced downstream
    autoInstantiateNodeAsMobxObservables(sourceObject) {
        const typeInfo = __1.NodeTypeUtils.getNodeType(sourceObject);
        switch (typeInfo.kind) {
            case 'Primitive': {
                return mobx_1.observable.box(sourceObject);
            }
            case 'Collection': {
                return mobx_1.observable(new Array());
            }
            case 'Object': {
                return mobx_1.observable(new Object());
            }
        }
    }
    //
    // Just needs to return empty objects or collections, as these will get synced downstream
    autoInstantiateNodeAsPlainObjectLiterals(sourceObject) {
        const typeInfo = __1.NodeTypeUtils.getNodeType(sourceObject);
        switch (typeInfo.kind) {
            case 'Primitive': {
                return sourceObject;
            }
            case 'Collection': {
                return new Array();
            }
            case 'Object': {
                return new Object();
            }
        }
    }
}
exports.RdoInternalNWBase = RdoInternalNWBase;
//# sourceMappingURL=rdo-internal-nw-base.js.map