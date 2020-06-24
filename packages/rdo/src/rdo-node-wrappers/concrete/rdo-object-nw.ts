import { RdoInternalNWBase, NodeTypeUtils, RdoPrimitiveNW } from '..';
import {
  IContinueSmartSync,
  IEqualityComparer,
  IGlobalNodeOptions,
  IsIAfterSyncIfNeeded,
  IsIAfterSyncUpdate,
  IsIBeforeSyncIfNeeded,
  IsIBeforeSyncUpdate,
  IsICustomEqualityRDO,
  IsICustomSync,
  IsIHasCustomRdoFieldNames,
  isISourceInternalNodeWrapper,
  ISourceNodeWrapper,
  ISyncChildNode,
  IWrapRdoNode,
  NodeTypeInfo,
} from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { Logger } from '../../infrastructure/logger';
import { INodeSyncOptions, IRdoInternalNodeWrapper, isIRdoInternalNodeWrapper } from '../../types';
import { NodeChange } from '../../types/event-types';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';

const logger = Logger.make('RdoObjectNW');
type MutableCachedNodeItemType<S> = { sourceData: S | null | undefined };

export class RdoObjectNW<K extends string, S, D extends Record<K, any>> extends RdoInternalNWBase<K, S, D> {
  private _value: D;
  private _equalityComparer: IEqualityComparer;
  private _wrapRdoNode: IWrapRdoNode;

  constructor({
    value,
    typeInfo,
    key,
    mutableNodeCache,
    wrappedParentRdoNode,
    wrappedSourceNode,
    defaultEqualityComparer,
    syncChildNode,
    wrapRdoNode,
    globalNodeOptions,
    matchingNodeOptions,
    targetedOptionMatchersArray,
    eventEmitter,
  }: {
    value: D;
    typeInfo: NodeTypeInfo;
    key: K | undefined;
    mutableNodeCache: MutableNodeCache;
    wrappedParentRdoNode: IRdoInternalNodeWrapper<any, S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<K, S, D>;
    defaultEqualityComparer: IEqualityComparer;
    syncChildNode: ISyncChildNode;
    wrapRdoNode: IWrapRdoNode;
    matchingNodeOptions: INodeSyncOptions<any, any, any> | undefined;
    globalNodeOptions: IGlobalNodeOptions | undefined;
    targetedOptionMatchersArray: Array<INodeSyncOptions<any, any, any>>;
    eventEmitter: EventEmitter<NodeChange>;
  }) {
    super({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });

    this._value = value;
    this._equalityComparer = IsICustomEqualityRDO(value) ? value.isStateEqual : defaultEqualityComparer;
    this._wrapRdoNode = wrapRdoNode;
  }

  //------------------------------
  // Protected
  //------------------------------

  /** */
  public getNodeInstanceCache(): MutableCachedNodeItemType<S> {
    let mutableNodeCacheItem = this.mutableNodeCache.get<MutableCachedNodeItemType<S>>({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodePath });
    if (!mutableNodeCacheItem) {
      mutableNodeCacheItem = { sourceData: null };
      this.mutableNodeCache.set({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodePath, data: mutableNodeCacheItem });
    }
    return mutableNodeCacheItem;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get leafNode() {
    return false;
  }

  public get value() {
    return this._value;
  }

  public childElementCount(): number {
    return 0;
  }

  public smartSync(): boolean {
    let changed = false;
    const sourceNodePath = this.wrappedSourceNode.sourceNodePath;
    const rdo = this.value;
    const sourceObject = this.wrappedSourceNode.value;
    const mutableNodeCacheItem = this.getNodeInstanceCache();

    // Check if previous source state and new source state are equal
    const isAlreadyInSync = this._equalityComparer(sourceObject, mutableNodeCacheItem.sourceData);

    // Call lifecycle methods if found
    if (IsIBeforeSyncIfNeeded(rdo)) rdo.beforeSyncIfNeeded({ sourceObject, isSyncNeeded: !isAlreadyInSync });

    // Call lifecycle methods if found
    if (IsIBeforeSyncUpdate(rdo)) rdo.beforeSyncUpdate({ sourceObject });

    if (!isAlreadyInSync) {
      // Call lifecycle methods if found
      if (IsIBeforeSyncUpdate(rdo)) rdo.beforeSyncUpdate({ sourceObject });

      // Synchronize
      if (IsICustomSync(rdo)) {
        logger.trace(`synchronizeObjectState - ${sourceNodePath} - custom state synchronizer found. Using to sync`);
        changed = rdo.synchronizeState({ sourceObject, continueSmartSync: this.makeContinueSmartSyncFunction({ originalSourceNodePath: sourceNodePath }) });
      } else {
        logger.trace(`synchronizeObjectState - ${sourceNodePath} - no custom state synchronizer found. Using autoSync`, rdo);
        changed = this.sync();
        logger.trace(`synchronizeObjectState - ${sourceNodePath} - post autoSync`, rdo);
      }

      // Call lifecycle methods if found
      if (IsIAfterSyncUpdate(rdo)) rdo.afterSyncUpdate({ sourceObject });
    } else {
      logger.trace(`synchronizeObjectState - ${sourceNodePath} - already in sync. Skipping`);
    }

    // Call lifecycle methods if found
    if (IsIAfterSyncIfNeeded(rdo)) rdo.afterSyncIfNeeded({ sourceObject, syncAttempted: !isAlreadyInSync, RDOChanged: changed });

    // Update cache
    mutableNodeCacheItem.sourceData = sourceObject as S;

    return changed;
  }

  //------------------------------
  // IRdoInternalNodeWrapper
  //------------------------------

  public itemKeys() {
    return Object.keys(this._value);
  }

  public getItem(key: K) {
    return this._value[key];
  }

  public updateItem(key: K, value: D | undefined) {
    if (key in this._value) {
      //@ts-ignore
      this._value[key] = value;
      return true;
    } else return false;
  }

  public insertItem(key: K, value: D | undefined) {
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
  private sync(): boolean {
    let changed = false;

    if (!isISourceInternalNodeWrapper(this.wrappedSourceNode)) {
      throw new Error(`RDO object node can only be synced with Source object nodes (Path: '${this.wrappedSourceNode.sourceNodePath}')`);
    }

    // Loop properties
    for (const sourceFieldname of this.wrappedSourceNode.nodeKeys()) {
      const sourceFieldVal = this.wrappedSourceNode.getItem(sourceFieldname);
      let rdoFieldname = this.getFieldname({ sourceFieldname, sourceFieldVal });

      let rdoNodeItemValue: any;
      if (rdoFieldname) {
        rdoNodeItemValue = this.getItem(rdoFieldname);
      } else {
        // Auto-create Rdo object field if autoMakeRdoTypes.objectFields
        // Note: this creates an observable tree in the exact shape of the source data
        // It is recommended to consistently use autoMakeRdo* OR consistently provide customMakeRdo methods. Blending both can lead to unexpected behavior
        // Keys made here, instantiation takes place in downstream constructors
        if (this.globalNodeOptions?.autoMakeRdoTypes?.objectFields) {
          logger.trace(`sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - domainFieldname '${sourceFieldname}' auto making RDO`, sourceFieldVal);

          // Allocate fieldname and empty val
          rdoFieldname = sourceFieldname as K;
          rdoNodeItemValue = this.makeRdoElement(sourceFieldVal);

          // Insert
          this.insertItem(rdoFieldname, rdoNodeItemValue);

          // Emit
          this.eventEmitter.publish('nodeChange', { changeType: 'create', sourceNodePath: this.wrappedSourceNode.sourceNodePath, sourceKey: sourceFieldname, rdoKey: rdoFieldname, oldSourceValue: undefined, newSourceValue: sourceFieldVal });
        } else {
          logger.trace(`sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - fieldname '${sourceFieldname}' key not found in RDO. Skipping property`);
          continue;
        }
      }

      // Update directly if Leaf node
      // Or else step into child and sync
      if (sourceFieldVal === null || sourceFieldVal === undefined || NodeTypeUtils.isPrimitive(sourceFieldVal)) {
        logger.trace(`Skipping child sync and updating directly. Field '${rdoFieldname}' in object is undefined, null, or Primitive.`);
        changed = RdoPrimitiveNW.sync({ wrappedParentNode: this, sourceKey: sourceFieldname, rdoKey: rdoFieldname, newValue: sourceFieldVal, eventEmitter: this.eventEmitter });
      } else {
        logger.trace(`Syncing Field '${rdoFieldname}' in object`);
        changed = this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemValue, rdoNodeItemKey: rdoFieldname, sourceNodeItemKey: sourceFieldname }) && changed;
      }
    }

    return changed;
  }

  /**
   *
   */
  public getFieldname({ sourceFieldname, sourceFieldVal }: { sourceFieldname: K; sourceFieldVal: any }): K | undefined {
    // Set Destination Prop Key, and if not found, fall back to name with prefix if supplied
    let rdoFieldname: K | undefined;

    //
    // Try IHasCustomRdoFieldNames
    //
    if (!rdoFieldname && IsIHasCustomRdoFieldNames(this._value)) {
      rdoFieldname = this._value.tryGetRdoFieldname({ sourceNodePath: this.wrappedSourceNode.sourceNodePath, sourceFieldname, sourceFieldVal });
      // If fieldName not in wrappedParentRdoNode, set to null
      if (rdoFieldname && !(rdoFieldname in this._value)) {
        rdoFieldname = undefined;
      } else {
        logger.trace(`rdoFieldname '${rdoFieldname}' found with IHasCustomRdoFieldNames`);
      }
    }

    //
    // Try _globalNodeOptions
    //
    if (!rdoFieldname && this.globalNodeOptions?.tryGetRdoFieldname) {
      rdoFieldname = this.globalNodeOptions?.tryGetRdoFieldname({ sourceNodePath: this.wrappedSourceNode.sourceNodePath, sourceFieldname, sourceFieldVal });
      // If fieldName not in wrappedParentRdoNode, set to null
      if (rdoFieldname && !(rdoFieldname in this._value)) {
        rdoFieldname = undefined;
      } else {
        logger.trace(`rdoFieldname '${rdoFieldname}' found with _globalNodeOptions.tryGetRdoFieldname`);
      }
    }

    //
    // Try stright match for sourceFieldname
    if (!rdoFieldname) {
      rdoFieldname = sourceFieldname;
      if (rdoFieldname && !(rdoFieldname in this._value)) {
        rdoFieldname = undefined;
      } else {
        logger.trace(`rdoFieldname '${rdoFieldname}' found - straight match for sourceFieldname`);
      }
    }

    //
    // Try commonRdoFieldnamePostfix
    //
    if (!rdoFieldname && this.globalNodeOptions?.commonRdoFieldnamePostfix) {
      const domainPropKeyWithPostfix = `${sourceFieldname}${this.globalNodeOptions.commonRdoFieldnamePostfix}`;
      rdoFieldname = domainPropKeyWithPostfix as K | undefined;

      // If fieldName not in wrappedParentRdoNode, set to null
      if (rdoFieldname && !(rdoFieldname in this._value)) {
        rdoFieldname = undefined;
      } else {
        logger.trace(`rdoFieldname '${rdoFieldname}' found with commonRdoFieldnamePostfix`);
      }
    }

    return rdoFieldname;
  }

  /** */
  private makeContinueSmartSyncFunction = ({ originalSourceNodePath }: { originalSourceNodePath: string }) => {
    // Build method
    const continueSmartSync: IContinueSmartSync = ({ sourceNodeItemKey, sourceItemValue, rdoNodeItemKey, rdoNodeItemValue, sourceNodeSubPath }) => {
      const sourceNodePath = sourceNodeSubPath ? `${originalSourceNodePath}.${sourceNodeSubPath}` : originalSourceNodePath;
      const wrappedRdoNode = this._wrapRdoNode({ sourceNodePath, sourceNode: sourceItemValue, sourceNodeItemKey: sourceNodeItemKey, rdoNode: rdoNodeItemValue, rdoNodeItemKey: rdoNodeItemKey });
      if (!isIRdoInternalNodeWrapper(wrappedRdoNode)) throw new Error(`(${sourceNodePath}) makeContinueSmartSyncFunction can not be called on Leaf nodes`);

      return this.syncChildNode({ wrappedParentRdoNode: wrappedRdoNode, rdoNodeItemValue, rdoNodeItemKey, sourceNodeItemKey });
    };

    // return method
    return continueSmartSync;
  };
}
