import {
  CollectionUtils,
  comparers,
  IEqualityComparer,
  IGlobalPropertyNameTransformation,
  IGraphSynchronizer,
  IGraphSyncOptions,
  IMakeRDO,
  INodeSyncOptions,
  IRdoCollectionKeyFactory,
  IsIAfterSyncIfNeeded,
  IsIAfterSyncUpdate,
  IsIBeforeSyncIfNeeded,
  IsIBeforeSyncUpdate,
  IsICustomEqualityRDO,
  IsICustomSync,
  IsISyncableCollection,
  IsISyncableRDOCollection,
  ISyncableCollection,
  SyncUtils,
} from '.';
import { Logger } from './infrastructure/logger';
import { IsIHasCustomRdoFieldNames } from './types';

const logger = Logger.make('GraphSynchronizer');
const NON_MAP_COLLECTION_SIZE_WARNING_THREASHOLD = 100;

/**
 * INTERNAL TYPES
 *
 */

export type JavaScriptBuiltInType =
  | '[object Array]'
  | '[object Boolean]'
  | '[object Date]'
  | '[object Error]'
  | '[object Map]'
  | '[object Number]'
  | '[object Object]'
  | '[object RegExp]'
  | '[object Set]'
  | '[object String]'
  | '[object Undefined]';

export type JsonNodeKind = 'objectProperty' | 'arrayElement';

export type SourceNodeType = 'Primitive' | 'Array' | 'Object';
export type SourceNodeTypeInfo = { type: SourceNodeType | undefined; builtInType: JavaScriptBuiltInType };

export type RdoFieldType = 'Primitive' | 'Array' | 'Map' | 'Set' | 'ISyncableCollection' | 'Object';
export type RdoFieldTypeInfo = { type: RdoFieldType | undefined; builtInType: JavaScriptBuiltInType };

/**
 *
 *
 * @export
 * @class GraphSynchronizer
 */
export class GraphSynchronizer implements IGraphSynchronizer {
  // ------------------------------------------------------------------------------------------------------------------
  // INTERNAL STATE
  // ------------------------------------------------------------------------------------------------------------------
  private _defaultEqualityComparer: IEqualityComparer;
  private _globalNodeOptions: IGlobalPropertyNameTransformation | undefined;
  private _targetedOptionNodePathsMap: Map<string, INodeSyncOptions<any, any>>;
  private _targetedOptionMatchersArray: Array<INodeSyncOptions<any, any>>;
  private _sourceObjectMap = new Map<string, any>();
  private _sourceNodeInstancePathStack = new Array<string>();
  private _sourceNodePathStack = new Array<string>();

  // ------------------------------------------------------------------------------------------------------------------
  // PRIVATE PROPERTIES
  // ------------------------------------------------------------------------------------------------------------------
  private pushSourceNodeInstancePathOntoStack(key: string, sourceNodeKind: JsonNodeKind) {
    logger.trace(`Adding SourceNode to sourceNodeInstancePathStack: ${this.getSourceNodeInstancePath()} + ${key} (${sourceNodeKind})`);
    this._sourceNodeInstancePathStack.push(key);
    // reset locally cached dependencies
    this._sourceNodeInstancePath = undefined;

    // push to typepath if objectProperty
    if (sourceNodeKind === 'objectProperty') {
      this._sourceNodePathStack.push(key);
      // reset locally cached dependencies
      this._sourceNodePath = undefined;
    }
  }

  private popSourceNodeInstancePathFromStack(sourceNodeKind: JsonNodeKind) {
    const key = this._sourceNodeInstancePathStack.pop();
    logger.trace(`Popping ${key} off sourceNodeInstancePathStack: ${this.getSourceNodeInstancePath()} (${sourceNodeKind})`);
    // reset locally cached dependencies
    this._sourceNodeInstancePath = undefined;

    // pop from typepath if objectProperty
    if (sourceNodeKind === 'objectProperty') {
      this._sourceNodePathStack.pop();
      // reset locally cached dependencies
      this._sourceNodePath = undefined;
    }
  }

  // sourceNodeInstancePath is used for persisting previous source state
  private _sourceNodeInstancePath: string | undefined;
  private getSourceNodeInstancePath(): string {
    if (!this._sourceNodeInstancePath) this._sourceNodeInstancePath = this._sourceNodeInstancePathStack.join('.');
    return this._sourceNodeInstancePath || '';
  }

  // sourceNodePath is used for configuration generated options. It is essentially the node sourceNodeInstancePath, with the collection keys skipped. It is static, but  not unique per node
  private _sourceNodePath: string | undefined;
  private getSourceNodePath(): string {
    if (!this._sourceNodePath) this._sourceNodePath = this._sourceNodePathStack.join('.');
    return this._sourceNodePath || '';
  }

  private setLastSourceNodeInstancePathValue(value) {
    this._sourceObjectMap.set(this.getSourceNodeInstancePath(), value);
  }

  private getLastSourceNodeInstancePathValue(): any {
    return this._sourceObjectMap.get(this.getSourceNodeInstancePath());
  }

  // ------------------------------------------------------------------------------------------------------------------
  // CONSTRUCTOR
  // ------------------------------------------------------------------------------------------------------------------
  constructor(options?: IGraphSyncOptions) {
    this._defaultEqualityComparer = options?.customEqualityComparer || comparers.apollo;
    this._globalNodeOptions = options?.globalNodeOptions;
    this._targetedOptionNodePathsMap = new Map<string, INodeSyncOptions<any, any>>();
    this._targetedOptionMatchersArray = new Array<INodeSyncOptions<any, any>>();

    if (options?.targetedNodeOptions) {
      options?.targetedNodeOptions.forEach((targetedNodeOptionsItem) => {
        if (targetedNodeOptionsItem.sourceNodeMatcher.nodePath) this._targetedOptionNodePathsMap.set(targetedNodeOptionsItem.sourceNodeMatcher.nodePath, targetedNodeOptionsItem);
        this._targetedOptionMatchersArray.push(targetedNodeOptionsItem);
      });
    }
  }

  // ------------------------------------------------------------------------------------------------------------------
  // PRIVATE METHODS
  // ------------------------------------------------------------------------------------------------------------------

  /**
   *
   */
  private trySynchronizeObject<S extends Record<string, any>, D extends Record<string, any>>({ sourceNodePath, sourceObject, rdo }: { sourceNodePath: string; sourceObject: S; rdo: D }): boolean {
    let changed = false;

    // Loop properties
    for (const sourceFieldname of Object.keys(sourceObject)) {
      const sourceFieldVal = sourceObject[sourceFieldname];
      const rdoFieldname = this.getRdoFieldname({ sourceNodePath, sourceFieldname, sourceFieldVal, parentObject: rdo });

      // Check to see if key exists
      if (!rdoFieldname) {
        logger.trace(`domainFieldname '${rdoFieldname}' not found in RDO. Skipping property`);
        continue;
      }

      changed ==
        this.trySynchronizeNode({
          sourceNodeKind: 'objectProperty',
          sourceNodeKey: sourceFieldname,
          sourceNodeVal: sourceFieldVal,
          targetNodeKey: rdoFieldname,
          targetNodeVal: rdo[rdoFieldname],
          tryUpdateTargetNode: (key, value) => CollectionUtils.Record.tryUpdateItem({ record: rdo, key, value }),
        }) || changed;
    }

    return changed;
  }

  /**
   *
   */
  private getRdoFieldname<S extends Record<string, any>, D extends Record<string, any>>({
    sourceNodePath,
    sourceFieldname,
    sourceFieldVal,
    parentObject,
  }: {
    sourceNodePath: string;
    sourceFieldname: string;
    sourceFieldVal: any;
    parentObject: D;
  }): string | undefined {
    // Set Destination Prop Key, and if not found, fall back to name with prefix if supplied
    let rdoFieldname: string | undefined;

    //
    // Try IHasCustomRdoFieldNames
    //
    if (IsIHasCustomRdoFieldNames(parentObject)) {
      rdoFieldname = parentObject.tryGetRdoFieldname({ sourceNodePath, sourceFieldname, sourceFieldVal });
      // If fieldName not in parent, set to null
      if (rdoFieldname && !(rdoFieldname in parentObject)) {
        rdoFieldname = undefined;
      } else {
        logger.trace(`rdoFieldname '${rdoFieldname}' found with IHasCustomRdoFieldNames`);
      }
    }

    //
    // Try _globalNodeOptions
    //
    if (this._globalNodeOptions?.tryGetRdoFieldname) {
      rdoFieldname = this._globalNodeOptions?.tryGetRdoFieldname({ sourceNodePath, sourceFieldname, sourceFieldVal });
      // If fieldName not in parent, set to null
      if (rdoFieldname && !(rdoFieldname in parentObject)) {
        rdoFieldname = undefined;
      } else {
        logger.trace(`rdoFieldname '${rdoFieldname}' found with _globalNodeOptions.tryGetRdoFieldname`);
      }
    }

    //
    // Try stright match for sourceFieldname
    if (!rdoFieldname) {
      rdoFieldname = sourceFieldname;
      if (rdoFieldname && !(rdoFieldname in parentObject)) {
        rdoFieldname = undefined;
      } else {
        logger.trace(`rdoFieldname '${rdoFieldname}' found - straight match for sourceFieldname`);
      }
    }

    //
    // Try commonRdoFieldnamePostfix
    //
    if (!rdoFieldname && this._globalNodeOptions?.commonRdoFieldnamePostfix) {
      const domainPropKeyWithPostfix = `${rdoFieldname}${this._globalNodeOptions.commonRdoFieldnamePostfix}`;
      rdoFieldname = domainPropKeyWithPostfix;

      // If fieldName not in parent, set to null
      if (rdoFieldname && !(rdoFieldname in parentObject)) {
        rdoFieldname = undefined;
      } else {
        logger.trace(`rdoFieldname '${rdoFieldname}' found with commonRdoFieldnamePostfix`);
      }
    }

    return rdoFieldname;
  }

  /**
   *
   */
  private getSourceNodeType(sourceNodeVal: any): SourceNodeTypeInfo {
    const sourceNodeBuiltInType = toString.call(sourceNodeVal) as JavaScriptBuiltInType;

    switch (sourceNodeBuiltInType) {
      case '[object Boolean]':
      case '[object Date]':
      case '[object Number]':
      case '[object String]': {
        return { type: 'Primitive', builtInType: sourceNodeBuiltInType };
      }
      case '[object Object]': {
        return { type: 'Object', builtInType: sourceNodeBuiltInType };
      }
      case '[object Array]': {
        return { type: 'Array', builtInType: sourceNodeBuiltInType };
      }
      default: {
        logger.warn(`Unable to find Source type for sourceNodeBuiltInType: ${sourceNodeBuiltInType}`, sourceNodeVal);
        return { type: undefined, builtInType: sourceNodeBuiltInType };
      }
    }
  }

  /**
   *
   */
  private getRdoFieldType(rdoVal: any): RdoFieldTypeInfo {
    const rdoBuiltInType = toString.call(rdoVal) as JavaScriptBuiltInType;

    if (IsISyncableCollection(rdoVal)) {
      return { type: 'ISyncableCollection', builtInType: rdoBuiltInType };
    }

    switch (rdoBuiltInType) {
      case '[object Boolean]':
      case '[object Date]':
      case '[object Number]':
      case '[object String]': {
        return { type: 'Primitive', builtInType: rdoBuiltInType };
      }
      case '[object Object]': {
        return { type: 'Object', builtInType: rdoBuiltInType };
      }
      case '[object Array]': {
        return { type: 'Array', builtInType: rdoBuiltInType };
      }
      case '[object Map]': {
        return { type: 'Map', builtInType: rdoBuiltInType };
      }
      case '[object Set]': {
        return { type: 'Set', builtInType: rdoBuiltInType };
      }
      default: {
        logger.warn(`Unable to find Domain type for rdoBuiltInType: ${rdoBuiltInType}`, rdoVal);
        return { type: undefined, builtInType: rdoBuiltInType };
      }
    }
  }

  /**
   *
   */
  private trySynchronizeNode({
    sourceNodeKind,
    sourceNodeKey,
    sourceNodeVal,
    targetNodeKey,
    targetNodeVal,
    tryUpdateTargetNode,
  }: {
    sourceNodeKind: JsonNodeKind;
    sourceNodeKey: string;
    sourceNodeVal: any;
    targetNodeKey: string;
    targetNodeVal: any;
    tryUpdateTargetNode: (key: string, value: any) => void;
  }): boolean {
    logger.trace(`synchronizeProperty (${targetNodeKey}) - enter`, { sourceNodeVal, targetNodeVal });

    // Setup
    let changed = false;

    // Node traversal tracking - step-in
    this.pushSourceNodeInstancePathOntoStack(sourceNodeKey, sourceNodeKind);

    // Test to see if node should be ignored
    const matchingOptions = this.getMatchingOptionsForNode();
    if (matchingOptions?.ignore) {
      logger.trace(`synchronizeProperty (${targetNodeKey}) - ignore node`);
    } else {
      // Type specific node processing
      const sourceNodeTypeInfo = this.getSourceNodeType(sourceNodeVal);
      const rdoTypeInfo = this.getRdoFieldType(targetNodeVal);

      changed = this.trySynchronizeNode_TypeSpecificProcessing({ sourceNodeTypeInfo, rdoTypeInfo, sourceNodeVal, targetNodeVal, targetNodeKey, tryUpdateTargetNode });
    }

    // Node traversal tracking - step-out
    this.setLastSourceNodeInstancePathValue(sourceNodeVal);
    this.popSourceNodeInstancePathFromStack(sourceNodeKind);
    return changed;
  }

  /** */
  private trySynchronizeNode_TypeSpecificProcessing({
    sourceNodeTypeInfo,
    rdoTypeInfo,
    sourceNodeVal,
    targetNodeVal,
    targetNodeKey,
    tryUpdateTargetNode,
  }: {
    sourceNodeTypeInfo: SourceNodeTypeInfo;
    rdoTypeInfo: RdoFieldTypeInfo;
    sourceNodeVal: any;
    targetNodeVal: any;
    targetNodeKey: string;
    tryUpdateTargetNode: (key: string, value: any) => void;
  }) {
    let changed = false;

    switch (sourceNodeTypeInfo.type) {
      case 'Primitive': {
        if (sourceNodeTypeInfo.builtInType !== rdoTypeInfo.builtInType && !!rdoTypeInfo.type) {
          throw Error(`For primitive types, the source type and the domain type must match. Source type: '${sourceNodeTypeInfo.builtInType}', Domain type: ${rdoTypeInfo.builtInType}`);
        }
        if (sourceNodeVal !== targetNodeVal) {
          logger.trace(`primitive value found in domainPropKey ${targetNodeKey}. Setting from old value to new value`, targetNodeVal, sourceNodeVal);
          tryUpdateTargetNode(targetNodeKey, sourceNodeVal);
          changed = true;
        }
        break;
      }
      case 'Object': {
        if (rdoTypeInfo.type !== 'Object') {
          throw Error(
            `[${this.getSourceNodeInstancePath()}] Object source types can only be synchronized to Object destination types, and must not be null. Source type: '${sourceNodeTypeInfo}', Domain type: ${rdoTypeInfo} `,
          );
        }
        changed = this.trySynchronizeObjectState({ key: targetNodeKey, sourceObject: sourceNodeVal, rdo: targetNodeVal });
        break;
      }
      case 'Array': {
        changed = this.synchronizeSourceArray({ rdoTypeInfo: rdoTypeInfo, sourceNodeTypeInfo: sourceNodeTypeInfo, rdoVal: targetNodeVal, sourceCollection: sourceNodeVal });
        break;
      }
      default: {
        logger.trace(`Skipping item ${this.getSourceNodeInstancePath()}. Unable to reconcile synchronization for types - sourceNodeTypeInfo: ${sourceNodeTypeInfo}), rdoTypeInfo: ${rdoTypeInfo}`);
        break;
      }
    }
    return changed;
  }

  /**
   *
   */
  private synchronizeSourceArray({
    rdoTypeInfo,
    sourceNodeTypeInfo,
    rdoVal,
    sourceCollection,
  }: {
    rdoTypeInfo: RdoFieldTypeInfo;
    sourceNodeTypeInfo: SourceNodeTypeInfo;
    rdoVal: any;
    sourceCollection: Array<any>;
  }): boolean {
    if (!rdoTypeInfo.type) throw Error(`Destination types must not be null when transforming Array source type. Source type: '${sourceNodeTypeInfo}', Domain type: ${rdoTypeInfo} `);

    const { makeRDOCollectionKey, makeRDO } = this.tryGetDomainCollectionProcessingMethods({ sourceCollection, domainCollection: rdoVal });

    // VALIDATE
    if (sourceCollection.length > 0 && !makeRDOCollectionKey?.fromSourceElement) {
      throw new Error(
        `Could not find 'makeRDOCollectionKey?.fromSourceElement)' (Path: '${this.getSourceNodePath()}', type: ${rdoTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IRDOFactory on the contained type`,
      );
    }
    if (sourceCollection.length > 0 && !makeRDO) {
      throw new Error(`Could not find 'makeRDO' (Path: '${this.getSourceNodePath()}', type: ${rdoTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IRDOFactory on the contained type`);
    }

    //
    // Execute the sync based on collection type
    //

    //-----------------------------------------------------
    // ISYNCABLECOLLECTION SYNC
    //-----------------------------------------------------
    if (rdoTypeInfo.type === 'ISyncableCollection') {
      const rdoCollection = rdoVal as ISyncableCollection<any>;

      if (sourceCollection.length === 0 && rdoCollection.size > 0) {
        rdoCollection.clear();
      }

      return this.synchronizeISyncableCollection({ sourceCollection, rdoCollection, makeRDOCollectionKey: makeRDOCollectionKey!, makeRDO: makeRDO! });

      //-----------------------------------------------------
      // MAP SYNC
      //-----------------------------------------------------
    } else if (rdoTypeInfo.type === 'Map') {
      const rdoCollection = rdoVal as Map<string, any>;

      if (sourceCollection.length === 0 && rdoCollection.size > 0) {
        rdoCollection.clear();
      }

      return this.synchronizeDomainMap({ sourceCollection, rdoCollection, makeRDOCollectionKey: makeRDOCollectionKey!, makeRDO: makeRDO! });

      //-----------------------------------------------------
      // SET SYNC
      //-----------------------------------------------------
    } else if (rdoTypeInfo.type === 'Set') {
      const rdoCollection = rdoVal as Set<any>;

      if (sourceCollection.length === 0 && rdoCollection.size > 0) {
        rdoCollection.clear();
      }

      if (rdoCollection.size > 0 && !makeRDOCollectionKey?.fromDomainElement)
        throw new Error(
          `Could not find '!makeRDOCollectionKey?.fromDomainElement' (Path: '${this.getSourceNodePath()}', type: ${rdoTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IRDOFactory on the contained type`,
        );
      if (sourceCollection.length > NON_MAP_COLLECTION_SIZE_WARNING_THREASHOLD)
        logger.warn(
          `Path: '${this.getSourceNodePath()}', collectionSize:${
            sourceCollection.lastIndexOf
          }, Domain collection type: Set - It is recommended that the Map or Custom collections types are used in the Domain objects for large collections. Set and Array collections will perform poorly with large collections`,
        );

      return this.synchronizeDomainSet({
        sourceCollection,
        rdoCollection,
        makeRDOCollectionKey: makeRDOCollectionKey!,
        makeRDO: makeRDO!,
      });

      //-----------------------------------------------------
      // ARRAY SYNC
      //-----------------------------------------------------
    } else if (rdoTypeInfo.type === 'Array') {
      const rdoCollection = rdoVal as Array<any>;

      if (sourceCollection.length === 0 && rdoCollection.length > 0) {
        CollectionUtils.Array.clear({ collection: rdoCollection });
      }

      if (rdoCollection.length > 0 && !makeRDOCollectionKey?.fromDomainElement)
        throw new Error(
          `Could not find 'makeRDOCollectionKeyFromDomainElement' (Path: '${this.getSourceNodePath()}', type: ${rdoTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IRDOFactory on the contained type`,
        );
      if (sourceCollection.length > 100)
        logger.warn(
          `Path: '${this.getSourceNodePath()}', collectionSize:${
            sourceCollection.lastIndexOf
          }, Domain collection type: Array - It is recommended that the Map or Custom collections types are used in the Domain objects for large collections. Set and Array collections will perform poorly with large collections`,
        );

      return this.synchronizeDomainArray({
        sourceCollection,
        rdoCollection,
        makeRDOCollectionKey: makeRDOCollectionKey!,
        makeRDO: makeRDO!,
      });
    }

    return false;
  }

  /** */
  private tryGetDomainCollectionProcessingMethods({ sourceCollection, domainCollection }: { sourceCollection: Array<any>; domainCollection: any }) {
    let makeRDOCollectionKey: IRdoCollectionKeyFactory<any, any> | undefined;
    let makeRDO: IMakeRDO<any, any> | undefined;

    const collectionElementType = this.getCollectionElementType({ sourceCollection, domainCollection });

    //
    // If types are primitive, provide auto methods, else try and get from configuration
    //
    if (collectionElementType === 'primitive' || collectionElementType === 'empty') {
      makeRDOCollectionKey = { fromSourceElement: (primitive) => primitive.toString(), fromDomainElement: (primitive) => primitive.toString() };
      makeRDO = (primitive) => primitive;
    } else {
      const targetDerivedOptions = this.getMatchingOptionsForCollectionNode({ sourceCollection, domainCollection });
      const typeDerivedOptions = IsISyncableRDOCollection(domainCollection)
        ? { makeRDOCollectionKey: domainCollection.makeRDOCollectionKey, makeRDO: domainCollection.makeRDO }
        : { makeRDOCollectionKeyFromSourceElement: undefined, makeRDOCollectionKeyFromDomainElement: domainCollection.makeRDOCollectionKeyFromDomainElement, makeRDO: undefined };

      // GET CONFIG ITEM: makeRDOCollectionKeyFromSourceElement
      makeRDOCollectionKey = targetDerivedOptions?.makeRDOCollectionKey || typeDerivedOptions.makeRDOCollectionKey || this.tryMakeAutoKeyMaker({ sourceCollection, domainCollection });

      // GET CONFIG ITEM: makeRDO
      makeRDO = targetDerivedOptions?.makeRDO || targetDerivedOptions?.makeRDO || typeDerivedOptions.makeRDO;
    }

    return { makeRDOCollectionKey, makeRDO };
  }

  /** */
  private getMatchingOptionsForNode(): INodeSyncOptions<any, any> | undefined {
    const currentPath = this.getSourceNodePath();
    return this._targetedOptionNodePathsMap.get(currentPath);
  }

  /** */
  private getMatchingOptionsForCollectionNode({ sourceCollection, domainCollection }: { sourceCollection: Array<any>; domainCollection: Iterable<any> }): INodeSyncOptions<any, any> | undefined {
    let options = this.getMatchingOptionsForNode();
    if (options) {
      return options;
    }

    if (this._targetedOptionMatchersArray.length === 0) return;

    // Selector targeted options could be matching elements of a collection
    // So look at the first element of source or domain collections to check

    // Try and get options from Source collection
    if (sourceCollection && sourceCollection.length > 0) {
      const firstItemInSourceCollection = sourceCollection[0];
      options = this._targetedOptionMatchersArray.find((targetOptionsItem) => (targetOptionsItem.sourceNodeMatcher.nodeContent ? targetOptionsItem.sourceNodeMatcher.nodeContent(firstItemInSourceCollection) : false));
      if (options) return options;
    }

    // Try and get options from Domain collection
    // ASSUMPTION - all supported collection types implement Iterable<>
    const firstItemInDomainCollection = domainCollection[Symbol.iterator]().next().value;
    options = this._targetedOptionMatchersArray.find((targetOptionsItem) => (targetOptionsItem.sourceNodeMatcher.nodeContent ? targetOptionsItem.sourceNodeMatcher.nodeContent(firstItemInDomainCollection) : false));
    return options;
  }

  /** */
  private tryMakeAutoKeyMaker({ sourceCollection, domainCollection }: { sourceCollection: Array<any>; domainCollection: Iterable<any> }): IRdoCollectionKeyFactory<any, any> | undefined {
    let makeRDOCollectionKey: IRdoCollectionKeyFactory<any, any> = {} as any;

    // Try and get options from source collection
    if (sourceCollection && sourceCollection.length > 0) {
      const firstItemInSourceCollection = sourceCollection[0];
      if (firstItemInSourceCollection && firstItemInSourceCollection.id) {
        makeRDOCollectionKey.fromSourceElement = (sourceNode: any) => {
          return sourceNode.id;
        };
      }
    }

    // Try and get options from domain collection
    const firstItemInDomainCollection = domainCollection[Symbol.iterator]().next().value;
    if (firstItemInDomainCollection) {
      let idKey = 'id';
      let hasIdKey = idKey in firstItemInDomainCollection;

      // If matching id key not found, try with standardPostfix if config setting supplied
      if (!hasIdKey && this._globalNodeOptions?.commonRdoFieldnamePostfix) {
        idKey = `${idKey}${this._globalNodeOptions.commonRdoFieldnamePostfix}`;
        hasIdKey = idKey in firstItemInDomainCollection;
      }

      if (hasIdKey) {
        makeRDOCollectionKey.fromDomainElement = (rdo: any) => {
          return rdo[idKey];
        };
      }
    }

    // Allow to return if fromDomainElement is null, even though this is not allowed in user supplied options
    //  When defaultKeyMaker, the code can handle a special case where fromDomainElement is null (when no items in domain collection)
    if (!makeRDOCollectionKey || !makeRDOCollectionKey.fromSourceElement) return undefined;
    else return makeRDOCollectionKey;
  }

  /** */
  private getCollectionElementType({ sourceCollection, domainCollection }: { sourceCollection: Array<any>; domainCollection: Iterable<any> }): 'empty' | 'primitive' | 'object' {
    // Try and get collection type from source collection
    if (sourceCollection && sourceCollection.length > 0) {
      const firstItemInSourceCollection = sourceCollection[0];
      const sourceNodeTypeInfo = this.getSourceNodeType(firstItemInSourceCollection);
      if (sourceNodeTypeInfo.type === 'Primitive') return 'primitive';
      else return 'object';
    }

    // Try and get collection type from Domain collection
    // ASSUMPTION - all supported collection types implement Iterable<>
    const firstItemInDomainCollection = domainCollection[Symbol.iterator]().next().value;
    if (!firstItemInDomainCollection) return 'empty';
    const rdoTypeInfo = this.getRdoFieldType(firstItemInDomainCollection);
    if (rdoTypeInfo.type === 'Primitive') return 'primitive';
    else return 'object';
  }

  /**
   *
   */
  private trySynchronizeObjectState<S extends Record<string, any>, D extends Record<string, any>>({ key, sourceObject, rdo }: { key: string; sourceObject: S; rdo: D; options?: IGraphSyncOptions }): boolean {
    let changed = false;
    const sourceNodePath = this.getSourceNodePath();
    const lastSourceObject = this.getLastSourceNodeInstancePathValue();

    // Check if previous source state and new source state are equal
    const isAlreadyInSync = IsICustomEqualityRDO(rdo) ? rdo.isStateEqual(sourceObject, lastSourceObject) : this._defaultEqualityComparer(sourceObject, lastSourceObject);

    // Call lifecycle methods if found
    if (IsIBeforeSyncIfNeeded(rdo)) rdo.beforeSyncIfNeeded({ sourceObject, isSyncNeeded: !isAlreadyInSync });

    // Call lifecycle methods if found
    if (IsIBeforeSyncUpdate(rdo)) rdo.beforeSyncUpdate({ sourceObject });

    //logger.debug(`'${this.getSourceNodeInstancePath()}':isInSync ${isInSync}`, { sourceObject, lastSourceObject });
    if (!isAlreadyInSync) {
      // Call lifecycle methods if found
      if (IsIBeforeSyncUpdate(rdo)) rdo.beforeSyncUpdate({ sourceObject });

      // Synchronize
      if (IsICustomSync(rdo)) {
        logger.trace(`synchronizeObjectState - ${sourceNodePath} - custom state synchronizer found. Using to sync`);
        changed = rdo.synchronizeState({ sourceObject, graphSynchronizer: this });
      } else {
        logger.trace(`synchronizeObjectState - ${sourceNodePath} - no custom state synchronizer found. Using autoSync`);
        changed = this.trySynchronizeObject({ sourceNodePath, sourceObject, rdo });
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
  private synchronizeISyncableCollection<S, D>({
    sourceCollection,
    rdoCollection,
    makeRDOCollectionKey,
    makeRDO,
  }: {
    sourceCollection: Array<S>;
    rdoCollection: ISyncableCollection<any>;
    makeRDOCollectionKey: IRdoCollectionKeyFactory<S, D>;
    makeRDO: IMakeRDO<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionSize: () => rdoCollection.size,
      getTargetCollectionKeys: rdoCollection.getKeys,
      makeRDOCollectionKeyFromSourceElement: makeRDOCollectionKey?.fromSourceElement!,
      tryGetItemFromTargetCollection: (key) => rdoCollection.tryGetItemFromTargetCollection(key),
      insertItemToTargetCollection: (key, value) => rdoCollection.insertItemToTargetCollection(key, value),
      tryDeleteItemFromTargetCollection: (key) => rdoCollection.tryDeleteItemFromTargetCollection(key),
      makeItemForTargetCollection: makeRDO,
      trySyncElement: ({ sourceElementKey, sourceElementVal, targetElementKey, targetElementVal }) =>
        this.trySynchronizeNode({
          sourceNodeKind: 'arrayElement',
          sourceNodeKey: sourceElementKey,
          sourceNodeVal: sourceElementVal,
          targetNodeKey: targetElementKey,
          targetNodeVal: targetElementVal,
          tryUpdateTargetNode: (key, value) => rdoCollection.updateItemInTargetCollection(key, value),
        }),
    });
  }

  /**
   *
   */
  private synchronizeDomainMap<S, D>({
    sourceCollection,
    rdoCollection,
    makeRDOCollectionKey,
    makeRDO,
  }: {
    sourceCollection: Array<S>;
    rdoCollection: Map<string, S>;
    makeRDOCollectionKey: IRdoCollectionKeyFactory<S, D>;
    makeRDO: IMakeRDO<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionSize: () => rdoCollection.size,
      getTargetCollectionKeys: () => Array.from(rdoCollection.keys()),
      makeRDOCollectionKeyFromSourceElement: makeRDOCollectionKey?.fromSourceElement,
      tryGetItemFromTargetCollection: (key) => rdoCollection.get(key),
      insertItemToTargetCollection: (key, value) => rdoCollection.set(key, value),
      tryDeleteItemFromTargetCollection: (key) => rdoCollection.delete(key),
      makeItemForTargetCollection: makeRDO,
      trySyncElement: ({ sourceElementKey, sourceElementVal, targetElementKey, targetElementVal }) =>
        this.trySynchronizeNode({
          sourceNodeKind: 'arrayElement',
          sourceNodeKey: sourceElementKey,
          sourceNodeVal: sourceElementVal,
          targetNodeKey: targetElementKey,
          targetNodeVal: targetElementVal,
          tryUpdateTargetNode: (key, value) => rdoCollection.set(key, value),
        }),
    });
  }

  /**
   *
   */
  private synchronizeDomainSet<S, D>({
    sourceCollection,
    rdoCollection,
    makeRDOCollectionKey,
    makeRDO,
  }: {
    sourceCollection: Array<S>;
    rdoCollection: Set<D>;
    makeRDOCollectionKey: IRdoCollectionKeyFactory<S, D>;
    makeRDO: IMakeRDO<S, D>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionSize: () => rdoCollection.size,
      getTargetCollectionKeys: makeRDOCollectionKey?.fromDomainElement ? () => CollectionUtils.Set.getKeys({ collection: rdoCollection, makeCollectionKey: makeRDOCollectionKey.fromDomainElement! }) : undefined,
      makeRDOCollectionKeyFromSourceElement: makeRDOCollectionKey?.fromSourceElement,
      tryGetItemFromTargetCollection: makeRDOCollectionKey?.fromDomainElement
        ? (key) => CollectionUtils.Set.tryGetItem({ collection: rdoCollection, makeCollectionKey: makeRDOCollectionKey.fromDomainElement!, key })
        : undefined,
      insertItemToTargetCollection: (key, value) => CollectionUtils.Set.insertItem({ collection: rdoCollection, key, value }),
      tryDeleteItemFromTargetCollection: makeRDOCollectionKey?.fromDomainElement
        ? (key) => CollectionUtils.Set.tryDeleteItem({ collection: rdoCollection, makeCollectionKey: makeRDOCollectionKey.fromDomainElement!, key })
        : undefined,
      makeItemForTargetCollection: makeRDO,
      trySyncElement: ({ sourceElementKey, sourceElementVal, targetElementKey, targetElementVal }) =>
        this.trySynchronizeNode({
          sourceNodeKind: 'arrayElement',
          sourceNodeKey: sourceElementKey,
          sourceNodeVal: sourceElementVal,
          targetNodeKey: targetElementKey,
          targetNodeVal: targetElementVal,
          tryUpdateTargetNode: (key, value) => CollectionUtils.Set.tryUpdateItem({ collection: rdoCollection, makeCollectionKey: makeRDOCollectionKey.fromDomainElement!, value }),
        }),
    });
  }

  /**
   *
   */
  private synchronizeDomainArray<S, D>({
    sourceCollection,
    rdoCollection,
    makeRDOCollectionKey,
    makeRDO,
  }: {
    sourceCollection: Array<S>;
    rdoCollection: Array<any>;
    makeRDOCollectionKey: IRdoCollectionKeyFactory<S, D>;
    makeRDO: IMakeRDO<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionSize: () => rdoCollection.length,
      getTargetCollectionKeys: makeRDOCollectionKey?.fromDomainElement ? () => CollectionUtils.Array.getKeys({ collection: rdoCollection, makeCollectionKey: makeRDOCollectionKey.fromDomainElement! }) : undefined,
      makeRDOCollectionKeyFromSourceElement: makeRDOCollectionKey?.fromSourceElement,
      makeItemForTargetCollection: makeRDO,
      tryGetItemFromTargetCollection: makeRDOCollectionKey?.fromDomainElement
        ? (key) => CollectionUtils.Array.getItem({ collection: rdoCollection, makeCollectionKey: makeRDOCollectionKey?.fromDomainElement!, key })
        : undefined,
      insertItemToTargetCollection: (key, value) => CollectionUtils.Array.insertItem({ collection: rdoCollection, key, value }),
      tryDeleteItemFromTargetCollection: makeRDOCollectionKey?.fromDomainElement
        ? (key) => CollectionUtils.Array.deleteItem({ collection: rdoCollection, makeCollectionKey: makeRDOCollectionKey.fromDomainElement!, key })
        : undefined,
      trySyncElement: ({ sourceElementKey, sourceElementVal, targetElementKey, targetElementVal }) =>
        this.trySynchronizeNode({
          sourceNodeKind: 'arrayElement',
          sourceNodeKey: sourceElementKey,
          sourceNodeVal: sourceElementVal,
          targetNodeKey: targetElementKey,
          targetNodeVal: targetElementVal,
          tryUpdateTargetNode: (key, value) => CollectionUtils.Array.insertItem({ collection: rdoCollection, key, value }),
        }),
    });
  }

  // ------------------------------------------------------------------------------------------------------------------
  // PUBLIC METHODS
  // ------------------------------------------------------------------------------------------------------------------

  /**
   *
   */
  public smartSync<S extends Record<string, any>, D extends Record<string, any>>({ rootSourceNode, rootRdo }: { rootSourceNode: S; rootRdo: D }) {
    if (!rootSourceNode || !rootRdo) {
      logger.warn('smartSync - sourceObject or RDO was null. Exiting', { rootSourceNode, rootRdo });
      return;
    }

    logger.trace('smartSync - sync traversal of object tree starting at root', { rootSourceNode, rootRdo });
    this.trySynchronizeObject({ sourceNodePath: '', sourceObject: rootSourceNode, rdo: rootRdo });
    logger.trace('smartSync - object tree sync traversal completed', { rootSourceNode, rootRdo });
  }

  /**
   *
   *
   * @memberof GraphSynchronizer
   * @description clears the previously tracked data
   */
  public clearTrackedData() {
    this._sourceObjectMap.clear();
  }
}
