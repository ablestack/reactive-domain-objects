"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoObjectNW = void 0;
const __1 = require("..");
const __2 = require("../..");
const logger_1 = require("../../infrastructure/logger");
const types_1 = require("../../types");
const node_tracker_1 = require("../../infrastructure/node-tracker");
const logger = logger_1.Logger.make('RdoObjectNW');
class RdoObjectNW extends __1.RdoInternalNWBase {
    constructor({ value, typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, wrapRdoNode, globalNodeOptions, matchingNodeOptions, targetedOptionMatchersArray, eventEmitter, }) {
        super({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
        /** */
        this.makeContinueSmartSyncFunction = ({ originalSourceNodePath }) => {
            // Build method
            const continueSmartSync = ({ sourceNodeItemKey, sourceItemValue, rdoNodeItemKey, rdoNodeItemValue, sourceNodeSubPath }) => {
                const sourceNodeTypePath = sourceNodeSubPath ? `${originalSourceNodePath}${node_tracker_1.NodeTracker.nodePathSeperator}${sourceNodeSubPath}` : originalSourceNodePath;
                const sourceNodeInstancePath = `${sourceNodeTypePath}${node_tracker_1.NodeTracker.nodePathSeperator}${sourceNodeItemKey}`;
                const wrappedRdoNode = this._wrapRdoNode({ sourceNodeTypePath, sourceNodeInstancePath, sourceNode: sourceItemValue, sourceNodeItemKey: sourceNodeItemKey, rdoNode: rdoNodeItemValue, rdoNodeItemKey: rdoNodeItemKey });
                if (!types_1.isIRdoInternalNodeWrapper(wrappedRdoNode))
                    throw new Error(`(${sourceNodeTypePath}) makeContinueSmartSyncFunction can not be called on Leaf nodes`);
                return this.syncChildNode({ wrappedParentRdoNode: wrappedRdoNode, rdoNodeItemKey, sourceNodeItemKey });
            };
            // return method
            return continueSmartSync;
        };
        this._value = value;
        this._equalityComparer = __2.IsICustomEqualityRDO(value) ? value.isStateEqual : defaultEqualityComparer;
        this._wrapRdoNode = wrapRdoNode;
    }
    //------------------------------
    // Protected
    //------------------------------
    /** */
    getNodeInstanceCache() {
        let mutableNodeCacheItem = this.mutableNodeCache.get({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath });
        if (!mutableNodeCacheItem) {
            mutableNodeCacheItem = { sourceData: null };
            this.mutableNodeCache.set({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath, data: mutableNodeCacheItem });
        }
        return mutableNodeCacheItem;
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
    childElementCount() {
        return 0;
    }
    smartSync() {
        let changed = false;
        const sourceNodeTypePath = this.wrappedSourceNode.sourceNodeTypePath;
        const rdo = this.value;
        const sourceObject = this.wrappedSourceNode.value;
        const previousSourceData = this.getNodeInstanceCache();
        // Check if previous source state and new source state are equal
        const isAlreadyInSync = this._equalityComparer(sourceObject, previousSourceData.sourceData);
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
                logger.trace(`synchronizeObjectState - ${sourceNodeTypePath} - custom state synchronizer found. Using to sync`);
                changed = rdo.synchronizeState({ sourceObject, continueSmartSync: this.makeContinueSmartSyncFunction({ originalSourceNodePath: sourceNodeTypePath }) });
            }
            else {
                logger.trace(`synchronizeObjectState - ${sourceNodeTypePath} - no custom state synchronizer found. Using autoSync`, rdo);
                changed = this.sync();
                logger.trace(`synchronizeObjectState - ${sourceNodeTypePath} - post autoSync`, rdo);
            }
            // Call lifecycle methods if found
            if (__2.IsIAfterSyncUpdate(rdo))
                rdo.afterSyncUpdate({ sourceObject });
        }
        else {
            logger.trace(`synchronizeObjectState - ${sourceNodeTypePath} - already in sync. Skipping`);
        }
        // Call lifecycle methods if found
        if (__2.IsIAfterSyncIfNeeded(rdo))
            rdo.afterSyncIfNeeded({ sourceObject, syncAttempted: !isAlreadyInSync, RDOChanged: changed });
        // Update cache
        previousSourceData.sourceData = sourceObject;
        return changed;
    }
    getSourceNodeKeys() {
        if (!types_1.isISourceObjectNodeWrapper(this.wrappedSourceNode))
            throw new Error(`RDO object node can only be synced with Source object nodes (Path: '${this.wrappedSourceNode.sourceNodeTypePath}')`);
        return this.wrappedSourceNode.getNodeKeys();
    }
    getSourceNodeItem(key) {
        if (!types_1.isISourceObjectNodeWrapper(this.wrappedSourceNode))
            throw new Error(`RDO object node can only be synced with Source object nodes (Path: '${this.wrappedSourceNode.sourceNodeTypePath}')`);
        return this.wrappedSourceNode.getNodeItem(key);
    }
    //------------------------------
    // IRdoInternalNodeWrapper
    //------------------------------
    // public itemKeys() {
    //   return Object.keys(this._value);
    // }
    getItem(key) {
        return this._value[key];
    }
    // public updateItem(key: K, value: D | undefined) {
    //   if (key in this._value) {
    //     //@ts-ignore
    //     this._value[key] = value;
    //     return true;
    //   } else return false;
    // }
    // public insertItem(key: K, value: D | undefined) {
    //   if (!(key in this._value)) {
    //     //@ts-ignore
    //     this._value[key] = value;
    //     return true;
    //   }
    //   return false;
    // }
    //--------------------------------------
    // Private Methods
    //--------------------------------------
    /**
     *
     */
    sync() {
        var _a, _b;
        let changed = false;
        const wrappedSourceNode = this.wrappedSourceNode;
        if (!types_1.isISourceObjectNodeWrapper(this.wrappedSourceNode)) {
            throw new Error(`RDO object node can only be synced with Source object nodes (Path: '${this.wrappedSourceNode.sourceNodeTypePath}')`);
        }
        // Loop properties
        for (const sourceFieldname of wrappedSourceNode.getNodeKeys()) {
            const sourceFieldVal = wrappedSourceNode.getNodeItem(sourceFieldname);
            let rdoFieldname = this.getFieldname({ sourceFieldname, sourceFieldVal });
            let rdoNodeItemValue;
            if (rdoFieldname) {
                rdoNodeItemValue = this.value[rdoFieldname];
            }
            else {
                // Auto-create Rdo object field if autoMakeRdoTypes.objectFields
                // Note: this creates an observable tree in the exact shape of the source data
                // It is recommended to consistently use autoMakeRdo* OR consistently provide customMakeRdo methods. Blending both can lead to unexpected behavior
                // Keys made here, instantiation takes place in downstream constructors
                if ((_b = (_a = this.globalNodeOptions) === null || _a === void 0 ? void 0 : _a.autoMakeRdoTypes) === null || _b === void 0 ? void 0 : _b.objectFields) {
                    logger.trace(`sourceNodeTypePath: ${this.wrappedSourceNode.sourceNodeTypePath} - domainFieldname '${sourceFieldname}' auto making RDO`, sourceFieldVal);
                    // Allocate fieldname and empty val
                    rdoFieldname = sourceFieldname;
                    rdoNodeItemValue = this.makeRdoElement(sourceFieldVal);
                    // Insert
                    this.value[rdoFieldname] = rdoNodeItemValue;
                    // Emit
                    this.eventEmitter.publish('nodeChange', { changeType: 'add', sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath, sourceKey: sourceFieldname, rdoKey: rdoFieldname, previousSourceValue: undefined, newSourceValue: sourceFieldVal });
                }
                else {
                    logger.trace(`sourceNodeTypePath: ${this.wrappedSourceNode.sourceNodeTypePath} - fieldname '${sourceFieldname}' key not found in RDO. Skipping property`);
                    continue;
                }
            }
            // Update directly if Leaf node
            // Or else step into child and sync
            if (sourceFieldVal === null || sourceFieldVal === undefined || __1.NodeTypeUtils.isPrimitive(sourceFieldVal)) {
                logger.trace(`Skipping child sync and updating directly. Field '${rdoFieldname}' in object is undefined, null, or Primitive.`);
                changed = this.primitiveDirectSync({ sourceKey: sourceFieldname, rdoKey: rdoFieldname, previousValue: rdoNodeItemValue, newValue: sourceFieldVal });
            }
            else {
                logger.trace(`Syncing Field '${rdoFieldname}' in object`);
                changed = this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemKey: rdoFieldname, sourceNodeItemKey: sourceFieldname }) && changed;
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
            rdoFieldname = this._value.tryGetRdoFieldname({ sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath, sourceFieldname, sourceFieldVal });
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
            rdoFieldname = (_b = this.globalNodeOptions) === null || _b === void 0 ? void 0 : _b.tryGetRdoFieldname({ sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath, sourceFieldname, sourceFieldVal });
            // If fieldName not in wrappedParentRdoNode, set to null
            if (rdoFieldname && !(rdoFieldname in this._value)) {
                rdoFieldname = undefined;
            }
            else {
                logger.trace(`rdoFieldname '${rdoFieldname}' found with _globalNodeOptions.tryGetRdoFieldname`);
            }
        }
        //
        // Try straight match for sourceFieldname
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
    /** */
    primitiveDirectSync({ sourceKey, rdoKey, previousValue, newValue }) {
        if (Object.is(previousValue, newValue)) {
            logger.trace(`smartSync - SourceNodePath:${this.wrappedSourceNode.sourceNodeTypePath}, values evaluate to Object.is equal. Not allocating value`, newValue);
            return false;
        }
        logger.trace(`primitive value found in domainPropKey ${rdoKey}. Setting from old value to new value`, previousValue, newValue);
        this.value[rdoKey] = newValue;
        this.eventEmitter.publish('nodeChange', {
            changeType: 'update',
            sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath,
            sourceKey,
            rdoKey,
            previousSourceValue: previousValue,
            newSourceValue: newValue,
        });
        return true;
    }
}
exports.RdoObjectNW = RdoObjectNW;
//# sourceMappingURL=rdo-object-nw.js.map