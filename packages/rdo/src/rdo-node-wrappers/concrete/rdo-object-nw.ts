import { RdoInternalNWBase, NodeTypeUtils } from '..';
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
import { INodeSyncOptions, IRdoInternalNodeWrapper, isIRdoInternalNodeWrapper, ISourceObjectNodeWrapper, isISourceObjectNodeWrapper } from '../../types';
import { NodeChange } from '../../types/event-types';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { NodeTracker } from '../../infrastructure/node-tracker';

const logger = Logger.make('RdoObjectNW');
type MutableCachedNodeItemType<S> = { sourceData: S | null | undefined };

export class RdoObjectNW<S, D extends Record<string, any>> extends RdoInternalNWBase<string | number, S, D> {
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
    key: string | number | undefined;
    mutableNodeCache: MutableNodeCache;
    wrappedParentRdoNode: IRdoInternalNodeWrapper<any, S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<string, S, D>;
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
    let mutableNodeCacheItem = this.mutableNodeCache.get<MutableCachedNodeItemType<S>>({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath });
    if (!mutableNodeCacheItem) {
      mutableNodeCacheItem = { sourceData: null };
      this.mutableNodeCache.set({ sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath, data: mutableNodeCacheItem });
    }
    return mutableNodeCacheItem;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get isLeafNode() {
    return false;
  }

  public get value() {
    return this._value as Record<string, any>;
  }

  public childElementCount(): number {
    return 0;
  }

  public smartSync(): boolean {
    let changed = false;
    const sourceNodeTypePath = this.wrappedSourceNode.sourceNodeTypePath;
    const rdo = this.value;
    const sourceObject = this.wrappedSourceNode.value;
    const previousSourceData = this.getNodeInstanceCache();

    // Check if previous source state and new source state are equal
    const isAlreadyInSync = this._equalityComparer(sourceObject, previousSourceData.sourceData);

    // Call lifecycle methods if found
    if (IsIBeforeSyncIfNeeded(rdo)) rdo.beforeSyncIfNeeded({ sourceObject, isSyncNeeded: !isAlreadyInSync });

    // Call lifecycle methods if found
    if (IsIBeforeSyncUpdate(rdo)) rdo.beforeSyncUpdate({ sourceObject });

    if (!isAlreadyInSync) {
      // Call lifecycle methods if found
      if (IsIBeforeSyncUpdate(rdo)) rdo.beforeSyncUpdate({ sourceObject });

      // Synchronize
      if (IsICustomSync(rdo)) {
        logger.trace(`synchronizeObjectState - ${sourceNodeTypePath} - custom state synchronizer found. Using to sync`);
        changed = rdo.synchronizeState({ sourceObject, continueSmartSync: this.makeContinueSmartSyncFunction({ originalSourceNodePath: sourceNodeTypePath }) });
      } else {
        logger.trace(`synchronizeObjectState - ${sourceNodeTypePath} - no custom state synchronizer found. Using autoSync`, rdo);
        changed = this.sync();
        logger.trace(`synchronizeObjectState - ${sourceNodeTypePath} - post autoSync`, rdo);
      }

      // Call lifecycle methods if found
      if (IsIAfterSyncUpdate(rdo)) rdo.afterSyncUpdate({ sourceObject });
    } else {
      logger.trace(`synchronizeObjectState - ${sourceNodeTypePath} - already in sync. Skipping`);
    }

    // Call lifecycle methods if found
    if (IsIAfterSyncIfNeeded(rdo)) rdo.afterSyncIfNeeded({ sourceObject, syncAttempted: !isAlreadyInSync, RDOChanged: changed });

    // Update cache;
    previousSourceData.sourceData = sourceObject as S;

    return changed;
  }

  public getSourceNodeKeys() {
    if (!isISourceObjectNodeWrapper(this.wrappedSourceNode)) throw new Error(`RDO object node can only be synced with Source object nodes (Path: '${this.wrappedSourceNode.sourceNodeTypePath}')`);
    return this.wrappedSourceNode.getNodeKeys();
  }

  public getSourceNodeItem(key: string) {
    if (!isISourceObjectNodeWrapper(this.wrappedSourceNode)) throw new Error(`RDO object node can only be synced with Source object nodes (Path: '${this.wrappedSourceNode.sourceNodeTypePath}')`);
    return this.wrappedSourceNode.getNodeItem(key);
  }

  //------------------------------
  // IRdoInternalNodeWrapper
  //------------------------------
  public getRdoNodeItem(key: string) {
    return this._value[key];
  }

  //--------------------------------------
  // Private Methods
  //--------------------------------------
  /**
   *
   */
  private sync(): boolean {
    let changed = false;
    const wrappedSourceNode = this.wrappedSourceNode as ISourceObjectNodeWrapper<S, D>;

    if (!isISourceObjectNodeWrapper(this.wrappedSourceNode)) {
      throw new Error(`RDO object node can only be synced with Source object nodes (Path: '${this.wrappedSourceNode.sourceNodeTypePath}')`);
    }

    // Loop properties
    for (const sourceFieldname of wrappedSourceNode.getNodeKeys()) {
      const sourceFieldVal = wrappedSourceNode.getNodeItem(sourceFieldname);
      let rdoFieldname = this.getFieldname({ sourceFieldname, sourceFieldVal });

      let rdoNodeItemValue: any;
      if (rdoFieldname) {
        rdoNodeItemValue = this.value[rdoFieldname];
      } else {
        // Auto-create Rdo object field if autoMakeRdoTypes.objectFields
        // Note: this creates an observable tree in the exact shape of the source data
        // It is recommended to consistently use autoMakeRdo* OR consistently provide customMakeRdo methods. Blending both can lead to unexpected behavior
        // Keys made here, instantiation takes place in downstream constructors
        if (this.globalNodeOptions?.autoMakeRdoTypes?.objectFields) {
          logger.trace(`sourceNodeTypePath: ${this.wrappedSourceNode.sourceNodeTypePath} - domainFieldname '${sourceFieldname}' auto making RDO`, sourceFieldVal);

          // Allocate fieldname and empty val
          rdoFieldname = sourceFieldname as string;
          rdoNodeItemValue = this.makeRdoElement(sourceFieldVal);

          // Insert
          this.value[rdoFieldname] = rdoNodeItemValue;

          // Emit
          this.eventEmitter.publish('nodeChange', {
            changeType: 'add',
            sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath,
            sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath,
            sourceKey: sourceFieldname,
            rdoKey: rdoFieldname,
            previousSourceValue: undefined,
            newSourceValue: sourceFieldVal,
          });
        } else {
          logger.trace(`sourceNodeTypePath: ${this.wrappedSourceNode.sourceNodeTypePath} - fieldname '${sourceFieldname}' key not found in RDO. Skipping property`);
          continue;
        }
      }

      // Update directly if Leaf node
      // Or else step into child and sync
      if (sourceFieldVal === null || sourceFieldVal === undefined || NodeTypeUtils.isPrimitive(sourceFieldVal)) {
        logger.trace(`Skipping child sync and updating directly. Field '${rdoFieldname}' in object is undefined, null, or Primitive.`);
        changed = this.primitiveDirectSync({ sourceKey: sourceFieldname, rdoKey: rdoFieldname, previousValue: rdoNodeItemValue, newValue: sourceFieldVal });
      } else {
        logger.trace(`Syncing Field '${rdoFieldname}' in object`);
        changed = this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemKey: rdoFieldname, sourceNodeItemKey: sourceFieldname }) && changed;
      }
    }

    return changed;
  }

  /**
   *
   */
  public getFieldname({ sourceFieldname, sourceFieldVal }: { sourceFieldname: string; sourceFieldVal: any }): string | undefined {
    // Set Destination Prop Key, and if not found, fall back to name with prefix if supplied
    let rdoFieldname: string | undefined;

    //
    // Try IHasCustomRdoFieldNames
    //
    if (!rdoFieldname && IsIHasCustomRdoFieldNames(this._value)) {
      rdoFieldname = this._value.tryGetRdoFieldname({ sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath, sourceFieldname, sourceFieldVal });
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
      rdoFieldname = this.globalNodeOptions?.tryGetRdoFieldname({ sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath, sourceFieldname, sourceFieldVal });
      // If fieldName not in wrappedParentRdoNode, set to null
      if (rdoFieldname && !(rdoFieldname in this._value)) {
        rdoFieldname = undefined;
      } else {
        logger.trace(`rdoFieldname '${rdoFieldname}' found with _globalNodeOptions.tryGetRdoFieldname`);
      }
    }

    //
    // Try straight match for sourceFieldname
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
      rdoFieldname = domainPropKeyWithPostfix as string | undefined;

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
    const continueSmartSync: IContinueSmartSync = ({ sourceNodeSubPath = '', sourceNode, sourceNodeItemKey, rdoNode, rdoNodeItemKey }) => {
      const sourceNodeTypePath = sourceNodeSubPath ? `${originalSourceNodePath}${NodeTracker.nodePathSeperator}${sourceNodeSubPath}` : originalSourceNodePath;
      const sourceNodeInstancePath = `${sourceNodeTypePath}${NodeTracker.nodePathSeperator}${sourceNodeItemKey}`;

      const wrappedRdoNode = this._wrapRdoNode({ sourceNodeTypePath, sourceNodeInstancePath, sourceNode, sourceNodeItemKey: sourceNodeItemKey, rdoNode, rdoNodeItemKey: rdoNodeItemKey });
      if (!isIRdoInternalNodeWrapper(wrappedRdoNode)) throw new Error(`(${sourceNodeTypePath}) makeContinueSmartSyncFunction can not be called on Leaf nodes`);

      return this.syncChildNode({ wrappedParentRdoNode: wrappedRdoNode, rdoNodeItemKey, sourceNodeItemKey });
    };

    // return method
    return continueSmartSync;
  };

  /** */
  private primitiveDirectSync<S, D>({ sourceKey, rdoKey, previousValue, newValue }: { sourceKey: string | number; rdoKey: string; previousValue: any; newValue: D }) {
    if (Object.is(previousValue, newValue)) {
      logger.trace(`smartSync - SourceNodePath:${this.wrappedSourceNode.sourceNodeTypePath}, values evaluate to Object.is equal. Not allocating value`, newValue);
      return false;
    }

    logger.trace(`primitive value found in domainPropKey ${rdoKey}. Setting from old value to new value`, previousValue, newValue);

    this.value[rdoKey] = newValue;

    this.eventEmitter.publish('nodeChange', {
      changeType: 'update',
      sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath,
      sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath,
      sourceKey,
      rdoKey,
      previousSourceValue: previousValue,
      newSourceValue: newValue,
    });

    return true;
  }
}
