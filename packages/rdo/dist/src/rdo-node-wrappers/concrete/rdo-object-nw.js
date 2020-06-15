"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoObjectNW = void 0;
const logger_1 = require("../../infrastructure/logger");
const __1 = require("..");
const __2 = require("../..");
const types_1 = require("../../types");
const logger = logger_1.Logger.make('RdoObjectNW');
class RdoObjectNW extends __1.RdoInternalNWBase {
    constructor({ value, typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, wrapRdoNode, globalNodeOptions, matchingNodeOptions, }) {
        super({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions });
        /** */
        this.makeContinueSmartSyncFunction = ({ originalSourceNodePath }) => {
            // Build method
            return ({ sourceNodeSubPath, sourceNodeItemKey, sourceItemValue, rdoNodeItemKey, rdoItemValue }) => {
                if (!sourceNodeSubPath)
                    throw new Error('continueSync sourceNodeSubPath must not be null or empty. continueSync can only be called on child objects');
                const sourceNodePath = `${originalSourceNodePath}.${sourceNodeSubPath}`;
                const wrappedRdoNode = this._wrapRdoNode({ sourceNodePath, sourceNode: sourceItemValue, sourceNodeItemKey: sourceNodeItemKey, rdoNode: rdoItemValue, rdoNodeItemKey: rdoNodeItemKey });
                if (!types_1.isIRdoInternalNodeWrapper(wrappedRdoNode))
                    throw new Error(`(${sourceNodePath}) makeContinueSmartSyncFunction can not be called on Leaf nodes`);
                return this._syncChildNode({ parentRdoNode: wrappedRdoNode, rdoNodeItemKey, sourceNodeItemKey });
            };
        };
        this._value = value;
        this._equalityComparer = __2.IsICustomEqualityRDO(value) ? value.isStateEqual : defaultEqualityComparer;
        this._wrapRdoNode = wrapRdoNode;
    }
    //------------------------------
    // IRdoNodeWrapper
    //------------------------------
    get value() {
        return this._value;
    }
    childElementCount() {
        return 0;
    }
    smartSync() {
        let changed = false;
        const sourceNodePath = this.wrappedSourceNode.sourceNodePath;
        const rdo = this.wrappedSourceNode.value;
        const sourceObject = this.wrappedSourceNode.value;
        const lastSourceObject = this.wrappedSourceNode.lastSourceNode;
        // Check if previous source state and new source state are equal
        const isAlreadyInSync = this._equalityComparer(sourceObject, lastSourceObject);
        // Call lifecycle methods if found
        if (__2.IsIBeforeSyncIfNeeded(rdo))
            rdo.beforeSyncIfNeeded({ sourceObject, isSyncNeeded: !isAlreadyInSync });
        // Call lifecycle methods if found
        if (__2.IsIBeforeSyncUpdate(rdo))
            rdo.beforeSyncUpdate({ sourceObject });
        if (!isAlreadyInSync) {
            // Call lifecycle methods if found
            if (__2.IsIBeforeSyncUpdate(rdo))
                rdo.beforeSyncUpdate({ sourceObject });
            // Synchronize
            if (__2.IsICustomSync(rdo)) {
                logger.trace(`synchronizeObjectState - ${sourceNodePath} - custom state synchronizer found. Using to sync`);
                changed = rdo.synchronizeState({ sourceObject, continueSmartSync: this.makeContinueSmartSyncFunction({ originalSourceNodePath: sourceNodePath }) });
            }
            else {
                logger.trace(`synchronizeObjectState - ${sourceNodePath} - no custom state synchronizer found. Using autoSync`);
                changed = this.sync();
            }
            // Call lifecycle methods if found
            if (__2.IsIAfterSyncUpdate(rdo))
                rdo.afterSyncUpdate({ sourceObject });
        }
        else {
            logger.trace(`synchronizeObjectState - ${sourceNodePath} - already in sync. Skipping`);
        }
        // Call lifecycle methods if found
        if (__2.IsIAfterSyncIfNeeded(rdo))
            rdo.afterSyncIfNeeded({ sourceObject, syncAttempted: !isAlreadyInSync, RDOChanged: changed });
        return changed;
    }
    //------------------------------
    // IRdoInternalNodeWrapper
    //------------------------------
    itemKeys() {
        return Object.keys(this._value);
    }
    getElement(key) {
        return this._value[key];
    }
    updateElement(key, value) {
        if (key in this._value) {
            //@ts-ignore
            this._value[key] = value;
            return true;
        }
        else
            return false;
    }
    //--------------------------------------
    // Private Methods
    //--------------------------------------
    /**
     *
     */
    sync() {
        let changed = false;
        if (!__2.isISourceInternalNodeWrapper(this.wrappedSourceNode))
            throw new Error(`RDO object node can only be synced with Source object nodes (Path: '${this.wrappedSourceNode.sourceNodePath}'`);
        // Loop properties
        for (const sourceFieldname of this.wrappedSourceNode.nodeKeys()) {
            const sourceFieldVal = this.wrappedSourceNode.getItem(sourceFieldname);
            const rdoFieldname = this.getFieldname({ sourceFieldname, sourceFieldVal });
            // Check to see if key exists
            if (!rdoFieldname) {
                logger.trace(`domainFieldname '${rdoFieldname}' not found in RDO. Skipping property`);
                continue;
            }
            changed = this._syncChildNode({ parentRdoNode: this, rdoNodeItemKey: rdoFieldname, sourceNodeItemKey: sourceFieldname });
        }
        return changed;
    }
    /**
     *
     */
    getFieldname({ sourceFieldname, sourceFieldVal }) {
        var _a, _b, _c;
        // Set Destination Prop Key, and if not found, fall back to name with prefix if supplied
        let rdoFieldname;
        //
        // Try IHasCustomRdoFieldNames
        //
        if (!rdoFieldname && __2.IsIHasCustomRdoFieldNames(this._value)) {
            rdoFieldname = this._value.tryGetRdoFieldname({ sourceNodePath: this.wrappedSourceNode.sourceNodePath, sourceFieldname, sourceFieldVal });
            // If fieldName not in wrappedParentRdoNode, set to null
            if (rdoFieldname && !(rdoFieldname in this._value)) {
                rdoFieldname = undefined;
            }
            else {
                logger.trace(`rdoFieldname '${rdoFieldname}' found with IHasCustomRdoFieldNames`);
            }
        }
        //
        // Try _globalNodeOptions
        //
        if (!rdoFieldname && ((_a = this.globalNodeOptions) === null || _a === void 0 ? void 0 : _a.tryGetRdoFieldname)) {
            rdoFieldname = (_b = this.globalNodeOptions) === null || _b === void 0 ? void 0 : _b.tryGetRdoFieldname({ sourceNodePath: this.wrappedSourceNode.sourceNodePath, sourceFieldname, sourceFieldVal });
            // If fieldName not in wrappedParentRdoNode, set to null
            if (rdoFieldname && !(rdoFieldname in this._value)) {
                rdoFieldname = undefined;
            }
            else {
                logger.trace(`rdoFieldname '${rdoFieldname}' found with _globalNodeOptions.tryGetRdoFieldname`);
            }
        }
        //
        // Try stright match for sourceFieldname
        if (!rdoFieldname) {
            rdoFieldname = sourceFieldname;
            if (rdoFieldname && !(rdoFieldname in this._value)) {
                rdoFieldname = undefined;
            }
            else {
                logger.trace(`rdoFieldname '${rdoFieldname}' found - straight match for sourceFieldname`);
            }
        }
        //
        // Try commonRdoFieldnamePostfix
        //
        if (!rdoFieldname && ((_c = this.globalNodeOptions) === null || _c === void 0 ? void 0 : _c.commonRdoFieldnamePostfix)) {
            const domainPropKeyWithPostfix = `${sourceFieldname}${this.globalNodeOptions.commonRdoFieldnamePostfix}`;
            rdoFieldname = domainPropKeyWithPostfix;
            // If fieldName not in wrappedParentRdoNode, set to null
            if (rdoFieldname && !(rdoFieldname in this._value)) {
                rdoFieldname = undefined;
            }
            else {
                logger.trace(`rdoFieldname '${rdoFieldname}' found with commonRdoFieldnamePostfix`);
            }
        }
        return rdoFieldname;
    }
}
exports.RdoObjectNW = RdoObjectNW;
//# sourceMappingURL=rdo-object-nw.js.map