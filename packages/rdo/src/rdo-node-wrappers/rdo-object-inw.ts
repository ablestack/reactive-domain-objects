import { IRdoInternalNodeWrapper } from '..';
import {
  IMakeCollectionKey,
  ISourceNodeWrapper,
  RdoNodeTypeInfo,
  IsIHasCustomRdoFieldNames,
  IGlobalPropertyNameTransformation,
  IsICustomEqualityRDO,
  IsIBeforeSyncIfNeeded,
  IsIBeforeSyncUpdate,
  IsICustomSync,
  IsIAfterSyncUpdate,
  IsIAfterSyncIfNeeded,
  IEqualityComparer,
  ISourceInternalNodeWrapper,
  ISyncChildElement,
  isIRdoInternalNodeWrapper,
  isISourceNodeWrapper,
  isISourceInternalNodeWrapper,
} from '../types';
import { Logger } from '../infrastructure/logger';

const logger = Logger.make('RdoObjectINW');

export class RdoObjectINW<D> implements IRdoInternalNodeWrapper<D> {
  private _object: object;
  private _makeKey?: IMakeCollectionKey<any>;
  private _wrappedSourceNode: ISourceNodeWrapper;
  private _globalNodeOptions: IGlobalPropertyNameTransformation | undefined;
  private _equalityComparer: IEqualityComparer;
  private _syncChildElement: ISyncChildElement<S, D>;

  constructor({
    node,
    wrappedSourceNode,
    makeKey,
    globalNodeOptions,
    defaultEqualityComparer,
    syncChildElement,
  }: {
    node: Record<string, any>;
    wrappedSourceNode: ISourceNodeWrapper;
    makeKey: IMakeCollectionKey<any>;
    globalNodeOptions: IGlobalPropertyNameTransformation | undefined;
    defaultEqualityComparer: IEqualityComparer;
    syncChildElement: ISyncChildElement<S, D>;
  }) {
    this._object = node;
    this._makeKey = makeKey;
    this._wrappedSourceNode = wrappedSourceNode;
    this._globalNodeOptions = globalNodeOptions;
    this._equalityComparer = IsICustomEqualityRDO(node) ? node.isStateEqual : defaultEqualityComparer;
    this._syncChildElement = syncChildElement;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get node() {
    return this._object;
  }

  public get typeInfo(): RdoNodeTypeInfo {
    return { kind: 'Object', type: 'Object', builtInType: '[object Object]' };
  }

  public keys() {
    return Object.keys(this._object);
  }

  public getItem(key: string) {
    return this._object[key];
  }

  public updateItem(value: any) {
    if (this._makeKey) {
      const key = this._makeKey(value);
      if (key in this._object) {
        this._object[key] = value;
        return true;
      } else return false;
    } else {
      throw new Error('make key from RDO element must be available for Object update operations');
    }
  }

  //------------------------------
  // IRdoInternalNodeWrapper
  //------------------------------
  public smartSync<S>({ lastSourceObject }: { lastSourceObject: any }): boolean {
    let changed = false;
    const sourceNodePath = this._wrappedSourceNode.sourceNodePath;
    const rdo = this._wrappedSourceNode.node;
    const sourceObject = this._wrappedSourceNode.node;

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
        logger.trace(`synchronizeObjectState - ${sourceNodePath} - no custom state synchronizer found. Using autoSync`);
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

  /**
   *
   */
  private sync(): boolean {
    let changed = false;

    if (!isISourceInternalNodeWrapper(this._wrappedSourceNode)) throw new Error(`RDO object node can only be synced with Source object nodes (Path: '${this._wrappedSourceNode.sourceNodePath}'`);

    // Loop properties
    for (const sourceFieldname of this._wrappedSourceNode.keys()) {
      const sourceFieldVal = this._wrappedSourceNode.getItem(sourceFieldname);
      const rdoFieldname = this.getFieldname({ sourceFieldname, sourceFieldVal });

      // Check to see if key exists
      if (!rdoFieldname) {
        logger.trace(`domainFieldname '${rdoFieldname}' not found in RDO. Skipping property`);
        continue;
      }

      changed = this._syncChildElement({
        sourceElementKey: sourceFieldname,
        sourceElementVal: sourceObject[sourceFieldname],
        targetElementKey: rdoFieldname,
        targetElementVal: rdo[rdoFieldname],
      });
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
    if (!rdoFieldname && IsIHasCustomRdoFieldNames(this._object)) {
      rdoFieldname = this._object.tryGetRdoFieldname({ sourceNodePath: this._wrappedSourceNode.sourceNodePath, sourceFieldname, sourceFieldVal });
      // If fieldName not in parent, set to null
      if (rdoFieldname && !(rdoFieldname in this._object)) {
        rdoFieldname = undefined;
      } else {
        logger.trace(`rdoFieldname '${rdoFieldname}' found with IHasCustomRdoFieldNames`);
      }
    }

    //
    // Try _globalNodeOptions
    //
    if (!rdoFieldname && this._globalNodeOptions?.tryGetRdoFieldname) {
      rdoFieldname = this._globalNodeOptions?.tryGetRdoFieldname({ sourceNodePath: this._wrappedSourceNode.sourceNodePath, sourceFieldname, sourceFieldVal });
      // If fieldName not in parent, set to null
      if (rdoFieldname && !(rdoFieldname in this._object)) {
        rdoFieldname = undefined;
      } else {
        logger.trace(`rdoFieldname '${rdoFieldname}' found with _globalNodeOptions.tryGetRdoFieldname`);
      }
    }

    //
    // Try stright match for sourceFieldname
    if (!rdoFieldname) {
      rdoFieldname = sourceFieldname;
      if (rdoFieldname && !(rdoFieldname in this._object)) {
        rdoFieldname = undefined;
      } else {
        logger.trace(`rdoFieldname '${rdoFieldname}' found - straight match for sourceFieldname`);
      }
    }

    //
    // Try commonRdoFieldnamePostfix
    //
    if (!rdoFieldname && this._globalNodeOptions?.commonRdoFieldnamePostfix) {
      const domainPropKeyWithPostfix = `${sourceFieldname}${this._globalNodeOptions.commonRdoFieldnamePostfix}`;
      rdoFieldname = domainPropKeyWithPostfix;

      // If fieldName not in parent, set to null
      if (rdoFieldname && !(rdoFieldname in this._object)) {
        rdoFieldname = undefined;
      } else {
        logger.trace(`rdoFieldname '${rdoFieldname}' found with commonRdoFieldnamePostfix`);
      }
    }

    return rdoFieldname;
  }

  //--------------------------------------
  // Private Methods
  //--------------------------------------
  private makeContinueSmartSyncFunction({
    originalSourceNodePath,
  }: {
    originalSourceNodePath: string;
  }): <S extends Record<string, any>, D extends Record<string, any>>({ sourceNodeSubPath, sourceObject, rdo }: { sourceNodeSubPath: string; sourceObject: S; rdo: D }) => boolean {
    return ({ sourceNodeSubPath: sourceNodeSubpath, sourceObject, rdo }) => {
      if (!sourceNodeSubpath) throw new Error('continueSync sourceNodeSubpath must not be null or empty. continueSync can only be called on child objects');

      const sourceNodePath = `${originalSourceNodePath}.${sourceNodeSubpath}`;
      return this.trySynchronizeObject({ sourceNodePath, sourceObject, rdo });
    };
  }
}
