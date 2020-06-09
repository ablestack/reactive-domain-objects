import {
  CollectionUtils,
  comparers,
  DomainNodeTypeInfo,
  IDomainNodeKeyFactory,
  IEqualityComparer,
  IGlobalPropertyNameTransformation,
  IGraphSynchronizer,
  IGraphSyncOptions,
  ImakeRDO,
  INodeSyncOptions,
  IsICustomEqualityRDO,
  IsICustomSync,
  IsIRDOFactory,
  IsISyncableCollection,
  ISyncableCollection,
  JavaScriptBuiltInType,
  JsonNodeKind,
  SourceNodeTypeInfo,
  SyncUtils,
} from '.';
import { Logger } from './infrastructure/logger';
import { IsIAfterSyncIfNeeded, IsIAfterSyncUpdate, IsIBeforeSyncIfNeeded, IsIBeforeSyncUpdate } from './types';

const logger = Logger.make('GraphSynchronizer');
const NON_MAP_COLLECTION_SIZE_WARNING_THREASHOLD = 100;

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
  private trySynchronizeObject<S extends Record<string, any>, D extends Record<string, any>>({ sourceNodePath, sourceObject, domainObject }: { sourceNodePath: string; sourceObject: S; domainObject: D }): boolean {
    let changed = false;

    // Loop properties
    for (const sourcePropKey of Object.keys(sourceObject)) {
      const sourcePropVal = sourceObject[sourcePropKey];

      // Set Destination Prop Key, and if not found, fall back to name with prefix if supplied
      let domainPropKey = this._globalNodeOptions?.computeDomainFieldname ? this._globalNodeOptions?.computeDomainFieldname({ sourceNodePath, sourcePropKey, sourcePropVal }) : sourcePropKey;
      if (!(domainPropKey in domainObject) && this._globalNodeOptions?.commonDomainFieldnamePostfix) {
        const domainPropKeyWithPostfix = `${domainPropKey}${this._globalNodeOptions.commonDomainFieldnamePostfix}`;
        logger.trace(`domainPropKey '${domainPropKey}' not found in RDO. Trying '${domainPropKeyWithPostfix}' `);
        domainPropKey = domainPropKeyWithPostfix;
      }

      // Check to see if key exists
      if (!(domainPropKey in domainObject)) {
        logger.trace(`domainPropKey '${domainPropKey}' not found in RDO. Skipping property`);
        continue;
      }

      changed ==
        this.trySynchronizeNode({
          sourceNodeKind: 'objectProperty',
          sourceNodeKey: sourcePropKey,
          sourceNodeVal: sourcePropVal,
          domainNodeKey: domainPropKey,
          domainNodeVal: domainObject[domainPropKey],
          tryUpdateDomainNode: (key, value) => CollectionUtils.Record.tryUpdateItem({ collection: domainObject, key, value }),
        }) || changed;
    }

    return changed;
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
  private getDomainNodeType(domainNodeVal: any): DomainNodeTypeInfo {
    const domainNodeBuiltInType = toString.call(domainNodeVal) as JavaScriptBuiltInType;

    if (IsISyncableCollection(domainNodeVal)) {
      return { type: 'ISyncableCollection', builtInType: domainNodeBuiltInType };
    }

    switch (domainNodeBuiltInType) {
      case '[object Boolean]':
      case '[object Date]':
      case '[object Number]':
      case '[object String]': {
        return { type: 'Primitive', builtInType: domainNodeBuiltInType };
      }
      case '[object Object]': {
        return { type: 'Object', builtInType: domainNodeBuiltInType };
      }
      case '[object Array]': {
        return { type: 'Array', builtInType: domainNodeBuiltInType };
      }
      case '[object Map]': {
        return { type: 'Map', builtInType: domainNodeBuiltInType };
      }
      case '[object Set]': {
        return { type: 'Set', builtInType: domainNodeBuiltInType };
      }
      default: {
        logger.warn(`Unable to find Domain type for domainNodeBuiltInType: ${domainNodeBuiltInType}`, domainNodeVal);
        return { type: undefined, builtInType: domainNodeBuiltInType };
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
    domainNodeKey,
    domainNodeVal,
    tryUpdateDomainNode,
  }: {
    sourceNodeKind: JsonNodeKind;
    sourceNodeKey: string;
    sourceNodeVal: any;
    domainNodeKey: string;
    domainNodeVal: any;
    tryUpdateDomainNode: (key: string, value: any) => void;
  }): boolean {
    logger.trace(`synchronizeProperty (${domainNodeKey}) - enter`, { sourceNodeVal, domainNodeVal });

    // Setup
    let changed = false;

    // Node traversal tracking - step-in
    this.pushSourceNodeInstancePathOntoStack(sourceNodeKey, sourceNodeKind);

    // Test to see if node should be ignored
    const matchingOptions = this.getMatchingOptionsForNode();
    if (matchingOptions?.ignore) {
      logger.trace(`synchronizeProperty (${domainNodeKey}) - ignore node`);
    } else {
      // Type specific node processing
      const sourceNodeTypeInfo = this.getSourceNodeType(sourceNodeVal);
      const domainNodeTypeInfo = this.getDomainNodeType(domainNodeVal);

      changed = this.trySynchronizeNode_TypeSpecificProcessing({ sourceNodeTypeInfo, domainNodeTypeInfo, sourceNodeVal, domainNodeVal, domainNodeKey, tryUpdateDomainNode });
    }

    // Node traversal tracking - step-out
    this.setLastSourceNodeInstancePathValue(sourceNodeVal);
    this.popSourceNodeInstancePathFromStack(sourceNodeKind);
    return changed;
  }

  /** */
  private trySynchronizeNode_TypeSpecificProcessing({
    sourceNodeTypeInfo,
    domainNodeTypeInfo,
    sourceNodeVal,
    domainNodeVal,
    domainNodeKey,
    tryUpdateDomainNode,
  }: {
    sourceNodeTypeInfo: SourceNodeTypeInfo;
    domainNodeTypeInfo: DomainNodeTypeInfo;
    sourceNodeVal: any;
    domainNodeVal: any;
    domainNodeKey: string;
    tryUpdateDomainNode: (key: string, value: any) => void;
  }) {
    let changed = false;

    switch (sourceNodeTypeInfo.type) {
      case 'Primitive': {
        if (sourceNodeTypeInfo.builtInType !== domainNodeTypeInfo.builtInType && !!domainNodeTypeInfo.type) {
          throw Error(`For primitive types, the source type and the domain type must match. Source type: '${sourceNodeTypeInfo.builtInType}', Domain type: ${domainNodeTypeInfo.builtInType}`);
        }
        if (sourceNodeVal !== domainNodeVal) {
          logger.trace(`primitive value found in domainPropKey ${domainNodeKey}. Setting from old value to new value`, domainNodeVal, sourceNodeVal);
          tryUpdateDomainNode(domainNodeKey, sourceNodeVal);
          changed = true;
        }
        break;
      }
      case 'Object': {
        if (domainNodeTypeInfo.type !== 'Object') {
          throw Error(
            `[${this.getSourceNodeInstancePath()}] Object source types can only be synchronized to Object destination types, and must not be null. Source type: '${sourceNodeTypeInfo}', Domain type: ${domainNodeTypeInfo} `,
          );
        }
        changed = this.trySynchronizeObjectState({ key: domainNodeKey, sourceObject: sourceNodeVal, domainObject: domainNodeVal });
        break;
      }
      case 'Array': {
        changed = this.synchronizeSourceArray({ domainNodeTypeInfo: domainNodeTypeInfo, sourceNodeTypeInfo: sourceNodeTypeInfo, domainNodeVal: domainNodeVal, sourceCollection: sourceNodeVal });
        break;
      }
      default: {
        logger.trace(`Skipping item ${this.getSourceNodeInstancePath()}. Unable to reconcile synchronization for types - sourceNodeTypeInfo: ${sourceNodeTypeInfo}), domainNodeTypeInfo: ${domainNodeTypeInfo}`);
        break;
      }
    }
    return changed;
  }

  /**
   *
   */
  private synchronizeSourceArray({
    domainNodeTypeInfo,
    sourceNodeTypeInfo,
    domainNodeVal,
    sourceCollection,
  }: {
    domainNodeTypeInfo: DomainNodeTypeInfo;
    sourceNodeTypeInfo: SourceNodeTypeInfo;
    domainNodeVal: any;
    sourceCollection: Array<any>;
  }): boolean {
    if (!domainNodeTypeInfo.type) throw Error(`Destination types must not be null when transforming Array source type. Source type: '${sourceNodeTypeInfo}', Domain type: ${domainNodeTypeInfo} `);

    const { makeRDOCollectionKey, makeRDO } = this.tryGetDomainCollectionProcessingMethods({ sourceCollection, domainCollection: domainNodeVal });

    // VALIDATE
    if (sourceCollection.length > 0 && !makeRDOCollectionKey?.fromSourceElement) {
      throw new Error(
        `Could not find 'makeRDOCollectionKey?.fromSourceElement)' (Path: '${this.getSourceNodePath()}', type: ${domainNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IRDOFactory on the contained type`,
      );
    }
    if (sourceCollection.length > 0 && !makeRDO) {
      throw new Error(`Could not find 'makeRDO' (Path: '${this.getSourceNodePath()}', type: ${domainNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IRDOFactory on the contained type`);
    }

    //
    // Execute the sync based on collection type
    //

    //-----------------------------------------------------
    // ISYNCABLECOLLECTION SYNC
    //-----------------------------------------------------
    if (domainNodeTypeInfo.type === 'ISyncableCollection') {
      const domainNodeCollection = domainNodeVal as ISyncableCollection<any>;

      if (sourceCollection.length === 0 && domainNodeCollection.size > 0) {
        domainNodeCollection.clear();
      }

      return this.synchronizeISyncableCollection({ sourceCollection, domainNodeCollection, makeRDOCollectionKey: makeRDOCollectionKey!, makeRDO: makeRDO! });

      //-----------------------------------------------------
      // MAP SYNC
      //-----------------------------------------------------
    } else if (domainNodeTypeInfo.type === 'Map') {
      const domainNodeCollection = domainNodeVal as Map<string, any>;

      if (sourceCollection.length === 0 && domainNodeCollection.size > 0) {
        domainNodeCollection.clear();
      }

      return this.synchronizeDomainMap({ sourceCollection, domainNodeCollection, makeRDOCollectionKey: makeRDOCollectionKey!, makeRDO: makeRDO! });

      //-----------------------------------------------------
      // SET SYNC
      //-----------------------------------------------------
    } else if (domainNodeTypeInfo.type === 'Set') {
      const domainNodeCollection = domainNodeVal as Set<any>;

      if (sourceCollection.length === 0 && domainNodeCollection.size > 0) {
        domainNodeCollection.clear();
      }

      if (domainNodeCollection.size > 0 && !makeRDOCollectionKey?.fromDomainElement)
        throw new Error(
          `Could not find '!makeRDOCollectionKey?.fromDomainElement' (Path: '${this.getSourceNodePath()}', type: ${domainNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IRDOFactory on the contained type`,
        );
      if (sourceCollection.length > NON_MAP_COLLECTION_SIZE_WARNING_THREASHOLD)
        logger.warn(
          `Path: '${this.getSourceNodePath()}', collectionSize:${
            sourceCollection.lastIndexOf
          }, Domain collection type: Set - It is recommended that the Map or Custom collections types are used in the Domain objects for large collections. Set and Array collections will perform poorly with large collections`,
        );

      return this.synchronizeDomainSet({
        sourceCollection,
        domainNodeCollection,
        makeRDOCollectionKey: makeRDOCollectionKey!,
        makeRDO: makeRDO!,
      });

      //-----------------------------------------------------
      // ARRAY SYNC
      //-----------------------------------------------------
    } else if (domainNodeTypeInfo.type === 'Array') {
      const domainNodeCollection = domainNodeVal as Array<any>;

      if (sourceCollection.length === 0 && domainNodeCollection.length > 0) {
        CollectionUtils.Array.clear({ collection: domainNodeCollection });
      }

      if (domainNodeCollection.length > 0 && !makeRDOCollectionKey?.fromDomainElement)
        throw new Error(
          `Could not find 'makeRDOCollectionKeyFromDomainElement' (Path: '${this.getSourceNodePath()}', type: ${domainNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IRDOFactory on the contained type`,
        );
      if (sourceCollection.length > 100)
        logger.warn(
          `Path: '${this.getSourceNodePath()}', collectionSize:${
            sourceCollection.lastIndexOf
          }, Domain collection type: Array - It is recommended that the Map or Custom collections types are used in the Domain objects for large collections. Set and Array collections will perform poorly with large collections`,
        );

      return this.synchronizeDomainArray({
        sourceCollection,
        domainNodeCollection,
        makeRDOCollectionKey: makeRDOCollectionKey!,
        makeRDO: makeRDO!,
      });
    }

    return false;
  }

  /** */
  private tryGetDomainCollectionProcessingMethods({ sourceCollection, domainCollection }: { sourceCollection: Array<any>; domainCollection: any }) {
    let makeRDOCollectionKey: IDomainNodeKeyFactory<any, any> | undefined;
    let makeRDO: ImakeRDO<any, any> | undefined;

    const collectionElementType = this.getCollectionElementType({ sourceCollection, domainCollection });

    //
    // If types are primitive, provide auto methods, else try and get from configuration
    //
    if (collectionElementType === 'primitive' || collectionElementType === 'empty') {
      makeRDOCollectionKey = { fromSourceElement: (primitive) => primitive.toString(), fromDomainElement: (primitive) => primitive.toString() };
      makeRDO = (primitive) => primitive;
    } else {
      const targetDerivedOptions = this.getMatchingOptionsForCollectionNode({ sourceCollection, domainCollection });
      const typeDerivedOptions = IsIRDOFactory(domainCollection)
        ? { makeRDOCollectionKey: domainCollection.makeRDOCollectionKey, makeRDO: domainCollection.makeRDO }
        : { makeRDOCollectionKeyFromSourceElement: undefined, makeRDOCollectionKeyFromDomainElement: domainCollection.makeRDOCollectionKeyFromDomainElement, makeRDO: undefined };

      // GET CONFIG ITEM: makeRDOCollectionKeyFromSourceElement
      makeRDOCollectionKey = targetDerivedOptions?.domainCollection?.makeRDOCollectionKey || typeDerivedOptions.makeRDOCollectionKey || this.tryMakeAutoKeyMaker({ sourceCollection, domainCollection });

      // GET CONFIG ITEM: makeRDO
      makeRDO = targetDerivedOptions?.domainCollection?.makeRDO || targetDerivedOptions?.domainCollection?.makeRDO || typeDerivedOptions.makeRDO;
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
  private tryMakeAutoKeyMaker({ sourceCollection, domainCollection }: { sourceCollection: Array<any>; domainCollection: Iterable<any> }): IDomainNodeKeyFactory<any, any> | undefined {
    let makeRDOCollectionKey: IDomainNodeKeyFactory<any, any> = {} as any;

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
      if (!hasIdKey && this._globalNodeOptions?.commonDomainFieldnamePostfix) {
        idKey = `${idKey}${this._globalNodeOptions.commonDomainFieldnamePostfix}`;
        hasIdKey = idKey in firstItemInDomainCollection;
      }

      if (hasIdKey) {
        makeRDOCollectionKey.fromDomainElement = (domainNode: any) => {
          return domainNode[idKey];
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
    const domainNodeTypeInfo = this.getDomainNodeType(firstItemInDomainCollection);
    if (domainNodeTypeInfo.type === 'Primitive') return 'primitive';
    else return 'object';
  }

  /**
   *
   */
  private trySynchronizeObjectState<S extends Record<string, any>, D extends Record<string, any>>({
    key,
    sourceObject,
    domainObject,
  }: {
    key: string;
    sourceObject: S;
    domainObject: D;
    options?: IGraphSyncOptions;
  }): boolean {
    let changed = false;
    const sourceNodePath = this.getSourceNodePath();
    const lastSourceObject = this.getLastSourceNodeInstancePathValue();

    // Check if previous source state and new source state are equal
    const isAlreadyInSync = IsICustomEqualityRDO(domainObject) ? domainObject.isStateEqual(sourceObject, lastSourceObject) : this._defaultEqualityComparer(sourceObject, lastSourceObject);

    // Call lifecycle methods if found
    if (IsIBeforeSyncIfNeeded(domainObject)) domainObject.beforeSyncIfNeeded({ sourceObject, isSyncNeeded: !isAlreadyInSync });

    // Call lifecycle methods if found
    if (IsIBeforeSyncUpdate(domainObject)) domainObject.beforeSyncUpdate({ sourceObject });

    //logger.debug(`'${this.getSourceNodeInstancePath()}':isInSync ${isInSync}`, { sourceObject, lastSourceObject });
    if (!isAlreadyInSync) {
      // Call lifecycle methods if found
      if (IsIBeforeSyncUpdate(domainObject)) domainObject.beforeSyncUpdate({ sourceObject });

      // Synchronize
      if (IsICustomSync(domainObject)) {
        logger.trace(`synchronizeObjectState - ${sourceNodePath} - custom state synchronizer found. Using to sync`);
        changed = domainObject.synchronizeState({ sourceObject, graphSynchronizer: this });
      } else {
        logger.trace(`synchronizeObjectState - ${sourceNodePath} - no custom state synchronizer found. Using autoSync`);
        changed = this.trySynchronizeObject({ sourceNodePath, sourceObject, domainObject });
      }

      // Call lifecycle methods if found
      if (IsIAfterSyncUpdate(domainObject)) domainObject.afterSyncUpdate({ sourceObject });
    } else {
      logger.trace(`synchronizeObjectState - ${sourceNodePath} - already in sync. Skipping`);
    }

    // Call lifecycle methods if found
    if (IsIAfterSyncIfNeeded(domainObject)) domainObject.afterSyncIfNeeded({ sourceObject, syncAttempted: !isAlreadyInSync, RDOChanged: changed });

    return changed;
  }

  /**
   *
   */
  private synchronizeISyncableCollection<S, D>({
    sourceCollection,
    domainNodeCollection,
    makeRDOCollectionKey,
    makeRDO,
  }: {
    sourceCollection: Array<S>;
    domainNodeCollection: ISyncableCollection<any>;
    makeRDOCollectionKey: IDomainNodeKeyFactory<S, D>;
    makeRDO: ImakeRDO<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionSize: () => domainNodeCollection.size,
      getTargetCollectionKeys: domainNodeCollection.getKeys,
      makeRDOCollectionKeyFromSourceElement: makeRDOCollectionKey?.fromSourceElement!,
      tryGetItemFromTargetCollection: (key) => domainNodeCollection.tryGetItemFromTargetCollection(key),
      insertItemToTargetCollection: (key, value) => domainNodeCollection.insertItemToTargetCollection(key, value),
      tryDeleteItemFromTargetCollection: (key) => domainNodeCollection.tryDeleteItemFromTargetCollection(key),
      makeItemForTargetCollection: makeRDO,
      trySyncElement: ({ sourceElementKey, sourceElementVal, targetElementKey, targetElementVal }) =>
        this.trySynchronizeNode({
          sourceNodeKind: 'arrayElement',
          sourceNodeKey: sourceElementKey,
          sourceNodeVal: sourceElementVal,
          domainNodeKey: targetElementKey,
          domainNodeVal: targetElementVal,
          tryUpdateDomainNode: (key, value) => domainNodeCollection.updateItemInTargetCollection(key, value),
        }),
    });
  }

  /**
   *
   */
  private synchronizeDomainMap<S, D>({
    sourceCollection,
    domainNodeCollection,
    makeRDOCollectionKey,
    makeRDO,
  }: {
    sourceCollection: Array<S>;
    domainNodeCollection: Map<string, S>;
    makeRDOCollectionKey: IDomainNodeKeyFactory<S, D>;
    makeRDO: ImakeRDO<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionSize: () => domainNodeCollection.size,
      getTargetCollectionKeys: () => Array.from(domainNodeCollection.keys()),
      makeRDOCollectionKeyFromSourceElement: makeRDOCollectionKey?.fromSourceElement,
      tryGetItemFromTargetCollection: (key) => domainNodeCollection.get(key),
      insertItemToTargetCollection: (key, value) => domainNodeCollection.set(key, value),
      tryDeleteItemFromTargetCollection: (key) => domainNodeCollection.delete(key),
      makeItemForTargetCollection: makeRDO,
      trySyncElement: ({ sourceElementKey, sourceElementVal, targetElementKey, targetElementVal }) =>
        this.trySynchronizeNode({
          sourceNodeKind: 'arrayElement',
          sourceNodeKey: sourceElementKey,
          sourceNodeVal: sourceElementVal,
          domainNodeKey: targetElementKey,
          domainNodeVal: targetElementVal,
          tryUpdateDomainNode: (key, value) => domainNodeCollection.set(key, value),
        }),
    });
  }

  /**
   *
   */
  private synchronizeDomainSet<S, D>({
    sourceCollection,
    domainNodeCollection,
    makeRDOCollectionKey,
    makeRDO,
  }: {
    sourceCollection: Array<S>;
    domainNodeCollection: Set<D>;
    makeRDOCollectionKey: IDomainNodeKeyFactory<S, D>;
    makeRDO: ImakeRDO<S, D>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionSize: () => domainNodeCollection.size,
      getTargetCollectionKeys: makeRDOCollectionKey?.fromDomainElement ? () => CollectionUtils.Set.getKeys({ collection: domainNodeCollection, makeKey: makeRDOCollectionKey.fromDomainElement! }) : undefined,
      makeRDOCollectionKeyFromSourceElement: makeRDOCollectionKey?.fromSourceElement,
      tryGetItemFromTargetCollection: makeRDOCollectionKey?.fromDomainElement
        ? (key) => CollectionUtils.Set.tryGetItem({ collection: domainNodeCollection, makeKey: makeRDOCollectionKey.fromDomainElement!, key })
        : undefined,
      insertItemToTargetCollection: (key, value) => CollectionUtils.Set.insertItem({ collection: domainNodeCollection, key, value }),
      tryDeleteItemFromTargetCollection: makeRDOCollectionKey?.fromDomainElement
        ? (key) => CollectionUtils.Set.tryDeleteItem({ collection: domainNodeCollection, makeKey: makeRDOCollectionKey.fromDomainElement!, key })
        : undefined,
      makeItemForTargetCollection: makeRDO,
      trySyncElement: ({ sourceElementKey, sourceElementVal, targetElementKey, targetElementVal }) =>
        this.trySynchronizeNode({
          sourceNodeKind: 'arrayElement',
          sourceNodeKey: sourceElementKey,
          sourceNodeVal: sourceElementVal,
          domainNodeKey: targetElementKey,
          domainNodeVal: targetElementVal,
          tryUpdateDomainNode: (key, value) => CollectionUtils.Set.tryUpdateItem({ collection: domainNodeCollection, makeKey: makeRDOCollectionKey.fromDomainElement!, value }),
        }),
    });
  }

  /**
   *
   */
  private synchronizeDomainArray<S, D>({
    sourceCollection,
    domainNodeCollection,
    makeRDOCollectionKey,
    makeRDO,
  }: {
    sourceCollection: Array<S>;
    domainNodeCollection: Array<any>;
    makeRDOCollectionKey: IDomainNodeKeyFactory<S, D>;
    makeRDO: ImakeRDO<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionSize: () => domainNodeCollection.length,
      getTargetCollectionKeys: makeRDOCollectionKey?.fromDomainElement ? () => CollectionUtils.Array.getKeys({ collection: domainNodeCollection, makeKey: makeRDOCollectionKey.fromDomainElement! }) : undefined,
      makeRDOCollectionKeyFromSourceElement: makeRDOCollectionKey?.fromSourceElement,
      makeItemForTargetCollection: makeRDO,
      tryGetItemFromTargetCollection: makeRDOCollectionKey?.fromDomainElement
        ? (key) => CollectionUtils.Array.getItem({ collection: domainNodeCollection, makeKey: makeRDOCollectionKey?.fromDomainElement!, key })
        : undefined,
      insertItemToTargetCollection: (key, value) => CollectionUtils.Array.insertItem({ collection: domainNodeCollection, key, value }),
      tryDeleteItemFromTargetCollection: makeRDOCollectionKey?.fromDomainElement
        ? (key) => CollectionUtils.Array.deleteItem({ collection: domainNodeCollection, makeKey: makeRDOCollectionKey.fromDomainElement!, key })
        : undefined,
      trySyncElement: ({ sourceElementKey, sourceElementVal, targetElementKey, targetElementVal }) =>
        this.trySynchronizeNode({
          sourceNodeKind: 'arrayElement',
          sourceNodeKey: sourceElementKey,
          sourceNodeVal: sourceElementVal,
          domainNodeKey: targetElementKey,
          domainNodeVal: targetElementVal,
          tryUpdateDomainNode: (key, value) => CollectionUtils.Array.insertItem({ collection: domainNodeCollection, key, value }),
        }),
    });
  }

  // ------------------------------------------------------------------------------------------------------------------
  // PUBLIC METHODS
  // ------------------------------------------------------------------------------------------------------------------

  /**
   *
   */
  public smartSync<S extends Record<string, any>, D extends Record<string, any>>({ rootSourceNode, rootDomainNode }: { rootSourceNode: S; rootDomainNode: D }) {
    if (!rootSourceNode || !rootDomainNode) {
      logger.warn('smartSync - sourceObject or RDO was null. Exiting', { rootSourceNode, rootSyncableObject: rootDomainNode });
      return;
    }

    logger.trace('smartSync - sync traversal of object tree starting at root', { rootSourceNode, rootSyncableObject: rootDomainNode });
    this.trySynchronizeObject({ sourceNodePath: '', sourceObject: rootSourceNode, domainObject: rootDomainNode });
    logger.trace('smartSync - object tree sync traversal completed', { rootSourceNode, rootSyncableObject: rootDomainNode });
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
