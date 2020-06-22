"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoObjectNW = void 0;
const __1 = require("..");
const __2 = require("../..");
const logger_1 = require("../../infrastructure/logger");
const types_1 = require("../../types");
const logger = logger_1.Logger.make('RdoObjectNW');
class RdoObjectNW extends __1.RdoInternalNWBase {
    constructor({ value, typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, wrapRdoNode, globalNodeOptions, matchingNodeOptions, targetedOptionMatchersArray, eventEmitter, }) {
        super({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
        /** */
        this.makeContinueSmartSyncFunction = ({ originalSourceNodePath }) => {
            // Build method
            const continueSmartSync = ({ sourceNodeItemKey, sourceItemValue, rdoNodeItemKey, rdoNodeItemValue, sourceNodeSubPath }) => {
                const sourceNodePath = sourceNodeSubPath ? `${originalSourceNodePath}.${sourceNodeSubPath}` : originalSourceNodePath;
                const wrappedRdoNode = this._wrapRdoNode({ sourceNodePath, sourceNode: sourceItemValue, sourceNodeItemKey: sourceNodeItemKey, rdoNode: rdoNodeItemValue, rdoNodeItemKey: rdoNodeItemKey });
                if (!types_1.isIRdoInternalNodeWrapper(wrappedRdoNode))
                    throw new Error(`(${sourceNodePath}) makeContinueSmartSyncFunction can not be called on Leaf nodes`);
                return this._syncChildNode({ wrappedParentRdoNode: wrappedRdoNode, rdoNodeItemValue, rdoNodeItemKey, sourceNodeItemKey });
            };
            // return method
            return continueSmartSync;
        };
        this._value = value;
        this._equalityComparer = __2.IsICustomEqualityRDO(value) ? value.isStateEqual : defaultEqualityComparer;
        this._wrapRdoNode = wrapRdoNode;
    }
    //------------------------------
    // IRdoNodeWrapper
    //------------------------------
    get leafNode() {
        return false;
    }
    get value() {
        return this._value;
    }
    childElementCount() {
        return 0;
    }
    smartSync() {
        let changed = false;
        const sourceNodePath = this.wrappedSourceNode.sourceNodePath;
        const rdo = this.value;
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
                logger.trace(`synchronizeObjectState - ${sourceNodePath} - no custom state synchronizer found. Using autoSync`, rdo);
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
    getItem(key) {
        return this._value[key];
    }
    updateItem(key, value) {
        if (key in this._value) {
            //@ts-ignore
            this._value[key] = value;
            return true;
        }
        else
            return false;
    }
    insertItem(key, value) {
        if (!(key in this._value)) {
            //@ts-ignore
            this._value[key] = value;
            return true;
        }
        return false;
    }
    //--------------------------------------
    // Private Methods
    //--------------------------------------
    /**
     *
     */
    sync() {
        var _a, _b;
        let changed = false;
        if (!__2.isISourceInternalNodeWrapper(this.wrappedSourceNode)) {
            throw new Error(`RDO object node can only be synced with Source object nodes (Path: '${this.wrappedSourceNode.sourceNodePath}')`);
        }
        // Loop properties
        for (const sourceFieldname of this.wrappedSourceNode.nodeKeys()) {
            const sourceFieldVal = this.wrappedSourceNode.getItem(sourceFieldname);
            let rdoFieldname = this.getFieldname({ sourceFieldname, sourceFieldVal });
            let rdoNodeItemValue;
            if (rdoFieldname) {
                rdoNodeItemValue = this.getItem(rdoFieldname);
            }
            else {
                // Auto-create Rdo object field if autoMakeRdoTypes.objectFields
                // Note: this creates an observable tree in the exact shape of the source data
                // It is recommended to consistently use autoMakeRdo* OR consistently provide customMakeRdo methods. Blending both can lead to unexpected behavior
                // Keys made here, instantiation takes place in downstream constructors
                if ((_b = (_a = this.globalNodeOptions) === null || _a === void 0 ? void 0 : _a.autoMakeRdoTypes) === null || _b === void 0 ? void 0 : _b.objectFields) {
                    logger.trace(`sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - domainFieldname '${sourceFieldname}' auto making RDO`, sourceFieldVal);
                    // Allocate fieldname and empty val
                    rdoFieldname = sourceFieldname;
                    rdoNodeItemValue = this.makeRdoElement(sourceFieldVal);
                    // Insert
                    this.insertItem(rdoFieldname, rdoNodeItemValue);
                    // Emit
                    this.eventEmitter.publish('nodeChange', { changeType: 'create', sourceNodePath: this.wrappedSourceNode.sourceNodePath, sourceKey: sourceFieldname, rdoKey: rdoFieldname, oldSourceValue: undefined, newSourceValue: sourceFieldVal });
                }
                else {
                    logger.trace(`sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - fieldname '${sourceFieldname}' key not found in RDO. Skipping property`);
                    continue;
                }
            }
            if (__1.NodeTypeUtils.isPrimitive(rdoNodeItemValue)) {
                logger.trace(`Field '${rdoFieldname}' in object is a Primitive Node. Skipping sync, and updating directly `);
                this.updateItem(rdoFieldname, rdoNodeItemValue);
            }
            else {
                logger.trace(`Syncing Field '${rdoFieldname}' in object`);
                changed = this._syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemValue, rdoNodeItemKey: rdoFieldname, sourceNodeItemKey: sourceFieldname }) && changed;
            }
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