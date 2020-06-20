import { Logger } from '../../infrastructure/logger';
import { RdoInternalNWBase } from '..';
import {
  IGlobalNodeOptions,
  IEqualityComparer,
  NodeTypeInfo,
  IRdoNodeWrapper,
  ISourceNodeWrapper,
  ISyncChildNode,
  IsICustomEqualityRDO,
  IsIBeforeSyncIfNeeded,
  IsIBeforeSyncUpdate,
  IsICustomSync,
  IsIAfterSyncUpdate,
  IsIAfterSyncIfNeeded,
  isISourceInternalNodeWrapper,
  IsIHasCustomRdoFieldNames,
  IWrapRdoNode,
  IContinueSmartSync,
} from '../..';
import { isIRdoInternalNodeWrapper, INodeSyncOptions, IRdoInternalNodeWrapper } from '../../types';
import { observable } from 'mobx';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { NodeChange } from '../../types/event-types';

const logger = Logger.make('RdoObjectNW');

export class RdoObjectNW<S, D extends Record<string, any>> extends RdoInternalNWBase<S, D> {
  private _value: D;
  private _equalityComparer: IEqualityComparer;
  private _wrapRdoNode: IWrapRdoNode;

  constructor({
    value,
    typeInfo,
    key,
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
    key: string | undefined;
    wrappedParentRdoNode: IRdoInternalNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S>;
    defaultEqualityComparer: IEqualityComparer;
    syncChildNode: ISyncChildNode<S, D>;
    wrapRdoNode: IWrapRdoNode;
    matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
    globalNodeOptions: IGlobalNodeOptions | undefined;
    targetedOptionMatchersArray: Array<INodeSyncOptions<any, any>>;
    eventEmitter: EventEmitter<NodeChange>;
  }) {
    super({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });

    this._value = value;

    this._equalityComparer = IsICustomEqualityRDO(value) ? value.isStateEqual : defaultEqualityComparer;
    this._wrapRdoNode = wrapRdoNode;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
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
    const lastSourceObject = this.wrappedSourceNode.lastSourceNode;

    // Check if previous source state and new source state are equal
    const isAlreadyInSync = this._equalityComparer(sourceObject, lastSourceObject);

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
      }

      // Call lifecycle methods if found
      if (IsIAfterSyncUpdate(rdo)) rdo.afterSyncUpdate({ sourceObject });
    } else {
      logger.trace(`synchronizeObjectState - ${sourceNodePath} - already in sync. Skipping`);
    }

    // Call lifecycle methods if found
    if (IsIAfterSyncIfNeeded(rdo)) rdo.afterSyncIfNeeded({ sourceObject, syncAttempted: !isAlreadyInSync, RDOChanged: changed });

    return changed;
  }

  //------------------------------
  // IRdoInternalNodeWrapper
  //------------------------------

  public itemKeys() {
    return Object.keys(this._value);
  }

  public getItem(key: string) {
    return this._value[key];
  }

  public updateItem(key: string, value: D | undefined) {
    if (key in this._value) {
      //@ts-ignore
      this._value[key] = value;
      return true;
    } else return false;
  }

  public insertItem(key: string, value: D | undefined) {
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
          rdoFieldname = sourceFieldname;
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

      changed = this._syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemValue, rdoNodeItemKey: rdoFieldname, sourceNodeItemKey: sourceFieldname });
    }

    return changed;
  }

  /**
   *
   */
  public getFieldname({ sourceFieldname, sourceFieldVal }: { sourceFieldname: string; sourceFieldVal: string }): string | undefined {
    // Set Destination Prop Key, and if not found, fall back to name with prefix if supplied
    let rdoFieldname: string | undefined;

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
      rdoFieldname = domainPropKeyWithPostfix;

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
  private makeContinueSmartSyncFunction = ({ originalSourceNodePath }: { originalSourceNodePath: string }): IContinueSmartSync => {
    // Build method
    return ({ sourceNodeItemKey, sourceItemValue, rdoNodeItemKey, rdoNodeItemValue, sourceNodeSubPath }) => {
      const sourceNodePath = sourceNodeSubPath ? `${originalSourceNodePath}.${sourceNodeSubPath}` : originalSourceNodePath;
      const wrappedRdoNode = this._wrapRdoNode({ sourceNodePath, sourceNode: sourceItemValue, sourceNodeItemKey: sourceNodeItemKey, rdoNode: rdoNodeItemValue, rdoNodeItemKey: rdoNodeItemKey });
      if (!isIRdoInternalNodeWrapper(wrappedRdoNode)) throw new Error(`(${sourceNodePath}) makeContinueSmartSyncFunction can not be called on Leaf nodes`);

      return this._syncChildNode({ wrappedParentRdoNode: wrappedRdoNode, rdoNodeItemValue, rdoNodeItemKey, sourceNodeItemKey });
    };
  };
}
