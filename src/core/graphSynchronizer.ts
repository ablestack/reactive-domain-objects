import { runInAction } from 'mobx';
import {
  IGraphSynchronizer,
  IEqualityComparer,
  IGlobalPropertyNameTransformation,
  INodeSyncOptions,
  JsonNodeKind,
  IGraphSyncOptions,
  comparers,
  CollectionUtils,
  SourceNodeTypeInfo,
  JavaScriptBuiltInType,
  DomainNodeTypeInfo,
  IsISyncableCollection,
  ISyncableCollection,
  IDomainNodeKeyFactory,
  IMakeDomainModel,
  IsIDomainModelFactory,
  IsICustomEqualityDomainModel,
  IsICustomSyncDomainModel,
  SyncUtils,
} from '..';
import { Logger } from '../infrastructure/logger';

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
  private _targetOptionsPathMap: Map<string, INodeSyncOptions<any, any>>;
  private _targetOptionsSelectorArray: Array<INodeSyncOptions<any, any>>;
  private _sourceObjectMap = new Map<string, any>();
  private _sourceNodeKeyChain = new Array<string>();
  private _sourceObjectKeyChain = new Array<string>();

  // ------------------------------------------------------------------------------------------------------------------
  // PRIVATE PROPERTIES
  // ------------------------------------------------------------------------------------------------------------------
  private addSourceNodeToPath(key: string, sourceNodeKind: JsonNodeKind) {
    logger.trace(`Adding SourceNode to nodePath: ${this.getSourceNodePath()} + ${key} (${sourceNodeKind})`);
    this._sourceNodeKeyChain.push(key);
    if (sourceNodeKind === 'objectProperty') this._sourceObjectKeyChain.push(key);
  }

  private removeSourceNodeFromPath(sourceNodeKind: JsonNodeKind) {
    const key = this._sourceNodeKeyChain.pop();
    logger.trace(`Removing SourceNode from nodePath: ${this.getSourceNodePath()} - ${key} (${sourceNodeKind})`);
    if (sourceNodeKind === 'objectProperty') this._sourceObjectKeyChain.pop();
  }

  // NodePath is used for persisting previous source state. It is unique per node, but dynamic (thus not predictable)
  private getSourceNodePath(): string {
    return this._sourceNodeKeyChain.join('.');
  }

  // ObjectPath is used for configuration generated options. It is the node nodePath, with the collection keys skipped. It is static, but  not unique per node
  private getSourceObjectPath(): string {
    return this._sourceObjectKeyChain.join('.');
  }

  private getLastSourceObject(): string {
    return this._sourceObjectMap.get(this.getSourceNodePath());
  }

  // ------------------------------------------------------------------------------------------------------------------
  // CONSTRUCTOR
  // ------------------------------------------------------------------------------------------------------------------
  constructor(options?: IGraphSyncOptions) {
    this._defaultEqualityComparer = options?.customEqualityComparer || comparers.apollo;
    this._globalNodeOptions = options?.globalNodeOptions;
    this._targetOptionsPathMap = new Map<string, INodeSyncOptions<any, any>>();
    this._targetOptionsSelectorArray = new Array<INodeSyncOptions<any, any>>();

    if (options?.targetedNodeOptions) {
      options?.targetedNodeOptions.forEach((targetedNodeOptionsItem) => {
        if (targetedNodeOptionsItem.sourceNodeMatcher.nodePath) this._targetOptionsPathMap.set(targetedNodeOptionsItem.sourceNodeMatcher.nodePath, targetedNodeOptionsItem);
        this._targetOptionsSelectorArray.push(targetedNodeOptionsItem);
      });
    }
  }

  // ------------------------------------------------------------------------------------------------------------------
  // PRIVATE METHODS
  // ------------------------------------------------------------------------------------------------------------------

  /**
   *
   */
  private trySynchronizeObject<S extends Record<string, any>, D extends Record<string, any>>({ sourceObjectPath, sourceObject, domainModel }: { sourceObjectPath: string; sourceObject: S; domainModel: D }): boolean {
    let changed = false;

    // Loop properties
    for (const sourcePropKey of Object.keys(sourceObject)) {
      const sourcePropVal = sourceObject[sourcePropKey];

      // Set Destination Prop Key, and if not found, fall back to name with prefix if supplied
      let domainPropKey = this._globalNodeOptions?.computeDomainFieldname ? this._globalNodeOptions?.computeDomainFieldname({ sourceObjectPath, sourcePropKey, sourcePropVal }) : sourcePropKey;
      if (!(domainPropKey in domainModel) && this._globalNodeOptions?.commonDomainFieldnamePostfix) {
        const domainPropKeyWithPostfix = `${domainPropKey}${this._globalNodeOptions.commonDomainFieldnamePostfix}`;
        logger.trace(`domainPropKey '${domainPropKey}' not found in domainModel. Trying '${domainPropKeyWithPostfix}' `);
        domainPropKey = domainPropKeyWithPostfix;
      }

      // Check to see if key exists
      if (!(domainPropKey in domainModel)) {
        logger.trace(`domainPropKey '${domainPropKey}' not found in domainModel. Skipping property`);
        continue;
      }

      changed ==
        this.trySynchronizeNode({
          sourceNodeKind: 'objectProperty',
          sourceNodeKey: sourcePropKey,
          sourceNodeVal: sourcePropVal,
          domainNodeKey: domainPropKey,
          domainNodeVal: domainModel[domainPropKey],
          tryUpdateDomainNode: (key, value) => CollectionUtils.Record.tryUpdateItem({ collection: domainModel, key, value }),
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
    this.addSourceNodeToPath(sourceNodeKey, sourceNodeKind);

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
    this.removeSourceNodeFromPath(sourceNodeKind);
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
          throw Error(`For primitive types, the source type and the domain type must match. Source type: '${sourceNodeTypeInfo}', Domain type: ${domainNodeTypeInfo}`);
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
            `[${this.getSourceNodePath()}] Object source types can only be synchronized to Object destination types, and must not be null. Source type: '${sourceNodeTypeInfo}', Domain type: ${domainNodeTypeInfo} `,
          );
        }
        changed = this.trySynchronizeObjectState({ key: domainNodeKey, sourceObject: sourceNodeVal, domainModel: domainNodeVal });
        break;
      }
      case 'Array': {
        changed = this.synchronizeSourceArray({ domainNodeTypeInfo: domainNodeTypeInfo, sourceNodeTypeInfo: sourceNodeTypeInfo, domainNodeVal: domainNodeVal, sourceCollection: sourceNodeVal });
        break;
      }
      default: {
        logger.trace(`Skipping item ${this.getSourceNodePath()}. Unable to reconcile synchronization for types - sourceNodeTypeInfo: ${sourceNodeTypeInfo}), domainNodeTypeInfo: ${domainNodeTypeInfo}`);
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

    const { makeCollectionKey, makeDomainModel } = this.tryGetDomainCollectionProcessingMethods({ sourceCollection, domainCollection: domainNodeVal });

    // VALIDATE
    if (sourceCollection.length > 0 && !makeCollectionKey?.fromSourceNode) {
      throw new Error(
        `Could not find 'makeCollectionKey?.fromSourceNode)' (Path: '${this.getSourceObjectPath()}', type: ${domainNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IDomainModelFactory on the contained type`,
      );
    }
    if (sourceCollection.length > 0 && !makeDomainModel) {
      throw new Error(
        `Could not find 'makeDomainModel' (Path: '${this.getSourceObjectPath()}', type: ${domainNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IDomainModelFactory on the contained type`,
      );
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

      return this.synchronizeISyncableCollection({ sourceCollection, domainNodeCollection, makeCollectionKey: makeCollectionKey!, makeDomainModel: makeDomainModel! });

      //-----------------------------------------------------
      // MAP SYNC
      //-----------------------------------------------------
    } else if (domainNodeTypeInfo.type === 'Map') {
      const domainNodeCollection = domainNodeVal as Map<string, any>;

      if (sourceCollection.length === 0 && domainNodeCollection.size > 0) {
        domainNodeCollection.clear();
      }

      return this.synchronizeDomainMap({ sourceCollection, domainNodeCollection, makeCollectionKey: makeCollectionKey!, makeDomainModel: makeDomainModel! });

      //-----------------------------------------------------
      // SET SYNC
      //-----------------------------------------------------
    } else if (domainNodeTypeInfo.type === 'Set') {
      const domainNodeCollection = domainNodeVal as Set<any>;

      if (sourceCollection.length === 0 && domainNodeCollection.size > 0) {
        domainNodeCollection.clear();
      }

      if (domainNodeCollection.size > 0 && !makeCollectionKey?.fromDomainModel)
        throw new Error(
          `Could not find '!makeCollectionKey?.fromDomainModel' (Path: '${this.getSourceObjectPath()}', type: ${domainNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IDomainModelFactory on the contained type`,
        );
      if (sourceCollection.length > NON_MAP_COLLECTION_SIZE_WARNING_THREASHOLD)
        logger.warn(
          `Path: '${this.getSourceObjectPath()}', collectionSize:${
            sourceCollection.lastIndexOf
          }, Domain collection type: Set - It is recommended that the Map or Custom collections types are used in the Domain objects for large collections. Set and Array collections will perform poorly with large collections`,
        );

      return this.synchronizeDomainSet({
        sourceCollection,
        domainNodeCollection,
        makeCollectionKey: makeCollectionKey!,
        makeDomainModel: makeDomainModel!,
      });

      //-----------------------------------------------------
      // ARRAY SYNC
      //-----------------------------------------------------
    } else if (domainNodeTypeInfo.type === 'Array') {
      const domainNodeCollection = domainNodeVal as Array<any>;

      if (sourceCollection.length === 0 && domainNodeCollection.length > 0) {
        CollectionUtils.Array.clear({ collection: domainNodeCollection });
      }

      if (domainNodeCollection.length > 0 && !makeCollectionKey?.fromDomainModel)
        throw new Error(
          `Could not find 'makeDomainNodeKeyFromDomainModel' (Path: '${this.getSourceObjectPath()}', type: ${domainNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IDomainModelFactory on the contained type`,
        );
      if (sourceCollection.length > 100)
        logger.warn(
          `Path: '${this.getSourceObjectPath()}', collectionSize:${
            sourceCollection.lastIndexOf
          }, Domain collection type: Array - It is recommended that the Map or Custom collections types are used in the Domain objects for large collections. Set and Array collections will perform poorly with large collections`,
        );

      return this.synchronizeDomainArray({
        sourceCollection,
        domainNodeCollection,
        makeCollectionKey: makeCollectionKey!,
        makeDomainModel: makeDomainModel!,
      });
    }

    return false;
  }

  /** */
  private tryGetDomainCollectionProcessingMethods({ sourceCollection, domainCollection }: { sourceCollection: Array<any>; domainCollection: any }) {
    let makeCollectionKey: IDomainNodeKeyFactory<any, any> | undefined;
    let makeDomainModel: IMakeDomainModel<any, any> | undefined;

    const collectionElementType = this.getCollectionElementType({ sourceCollection, domainCollection });

    //
    // If types are primitive, provide auto methods, else try and get from configuration
    //
    if (collectionElementType === 'primitive' || collectionElementType === 'empty') {
      makeCollectionKey = { fromSourceNode: (primitive) => primitive.toString(), fromDomainModel: (primitive) => primitive.toString() };
      makeDomainModel = (primitive) => primitive;
    } else {
      const targetDerivedOptions = this.getMatchingOptionsForCollectionNode({ sourceCollection, domainCollection });
      const typeDerivedOptions = IsIDomainModelFactory(domainCollection)
        ? { makeCollectionKey: domainCollection.makeCollectionKey, makeDomainModel: domainCollection.makeDomainModel }
        : { makeDomainNodeKeyFromSourceNode: undefined, makeDomainNodeKeyFromDomainModel: domainCollection.makeDomainNodeKeyFromDomainModel, makeDomainModel: undefined };

      // GET CONFIG ITEM: makeDomainNodeKeyFromSourceNode
      makeCollectionKey = targetDerivedOptions?.domainCollection?.makeCollectionKey || typeDerivedOptions.makeCollectionKey || this.tryMakeAutoKeyMaker({ sourceCollection, domainCollection });

      // GET CONFIG ITEM: makeDomainModel
      makeDomainModel = targetDerivedOptions?.domainCollection?.makeDomainModel || targetDerivedOptions?.domainCollection?.makeDomainModel || typeDerivedOptions.makeDomainModel;
    }

    return { makeCollectionKey, makeDomainModel };
  }

  /** */
  private getMatchingOptionsForNode(): INodeSyncOptions<any, any> | undefined {
    const currentPath = this.getSourceObjectPath();
    return this._targetOptionsPathMap.get(currentPath);
  }

  /** */
  private getMatchingOptionsForCollectionNode({ sourceCollection, domainCollection }: { sourceCollection: Array<any>; domainCollection: Iterable<any> }): INodeSyncOptions<any, any> | undefined {
    let options = this.getMatchingOptionsForNode();
    if (options) {
      return options;
    }

    if (this._targetOptionsSelectorArray.length === 0) return;

    // Selector targeted options could be matching elements of a collection
    // So look at the first element of source or domain collections to check

    // Try and get options from Source collection
    if (sourceCollection && sourceCollection.length > 0) {
      const firstItemInSourceCollection = sourceCollection[0];
      options = this._targetOptionsSelectorArray.find((targetOptionsItem) => (targetOptionsItem.sourceNodeMatcher.nodeContent ? targetOptionsItem.sourceNodeMatcher.nodeContent(firstItemInSourceCollection) : false));
      if (options) return options;
    }

    // Try and get options from Domain collection
    // ASSUMPTION - all supported collection types implement Iterable<>
    const firstItemInDomainCollection = domainCollection[Symbol.iterator]().next().value;
    options = this._targetOptionsSelectorArray.find((targetOptionsItem) => (targetOptionsItem.sourceNodeMatcher.nodeContent ? targetOptionsItem.sourceNodeMatcher.nodeContent(firstItemInDomainCollection) : false));
    return options;
  }

  /** */
  private tryMakeAutoKeyMaker({ sourceCollection, domainCollection }: { sourceCollection: Array<any>; domainCollection: Iterable<any> }): IDomainNodeKeyFactory<any, any> | undefined {
    let makeCollectionKey: IDomainNodeKeyFactory<any, any> = {} as any;

    // Try and get options from source collection
    if (sourceCollection && sourceCollection.length > 0) {
      const firstItemInSourceCollection = sourceCollection[0];
      if (firstItemInSourceCollection && firstItemInSourceCollection.id) {
        makeCollectionKey.fromSourceNode = (sourceNode: any) => {
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
        makeCollectionKey.fromDomainModel = (domainNode: any) => {
          return domainNode[idKey];
        };
      }
    }

    // Allow to return if fromDomainModel is null, even though this is not allowed in user supplied options
    //  When defaultKeyMaker, the code can handle a special case where fromDomainModel is null (when no items in domain collection)
    if (!makeCollectionKey || !makeCollectionKey.fromSourceNode) return undefined;
    else return makeCollectionKey;
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
    domainModel,
  }: {
    key: string;
    sourceObject: S;
    domainModel: D;
    options?: IGraphSyncOptions;
  }): boolean {
    let changed = false;
    const sourceObjectPath = this.getSourceObjectPath();
    const lastSourceObject = this.getLastSourceObject();

    // Check if already in sync
    const isInSync = IsICustomEqualityDomainModel(domainModel) ? domainModel.isStateEqual(sourceObject, lastSourceObject) : this._defaultEqualityComparer(sourceObject, lastSourceObject);
    if (!isInSync) {
      // Synchronize
      if (IsICustomSyncDomainModel(domainModel)) {
        logger.trace(`synchronizeObjectState - ${sourceObjectPath} - custom state synchronizer found. Using to sync`);
        changed = domainModel.synchronizeState({ sourceObject, graphSynchronizer: this });
      } else {
        logger.trace(`synchronizeObjectState - ${sourceObjectPath} - no custom state synchronizer found. Using autoSync`);
        changed = this.trySynchronizeObject({ sourceObjectPath, sourceObject, domainModel });
      }
    } else {
      logger.trace(`synchronizeObjectState - ${sourceObjectPath} - already in sync. Skipping`);
    }

    return changed;
  }

  /**
   *
   */
  private synchronizeISyncableCollection<S, D>({
    sourceCollection,
    domainNodeCollection,
    makeCollectionKey,
    makeDomainModel,
  }: {
    sourceCollection: Array<S>;
    domainNodeCollection: ISyncableCollection<any>;
    makeCollectionKey: IDomainNodeKeyFactory<S, D>;
    makeDomainModel: IMakeDomainModel<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionSize: () => domainNodeCollection.size,
      getTargetCollectionKeys: domainNodeCollection.getKeys,
      makeDomainNodeKeyFromSourceNode: makeCollectionKey?.fromSourceNode!,
      tryGetItemFromTargetCollection: (key) => domainNodeCollection.tryGetItemFromTargetCollection(key),
      insertItemToTargetCollection: (key, value) => domainNodeCollection.insertItemToTargetCollection(key, value),
      tryDeleteItemFromTargetCollection: (key) => domainNodeCollection.tryDeleteItemFromTargetCollection(key),
      makeItemForTargetCollection: makeDomainModel,
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
    makeCollectionKey,
    makeDomainModel,
  }: {
    sourceCollection: Array<S>;
    domainNodeCollection: Map<string, S>;
    makeCollectionKey: IDomainNodeKeyFactory<S, D>;
    makeDomainModel: IMakeDomainModel<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionSize: () => domainNodeCollection.size,
      getTargetCollectionKeys: () => Array.from(domainNodeCollection.keys()),
      makeDomainNodeKeyFromSourceNode: makeCollectionKey?.fromSourceNode,
      tryGetItemFromTargetCollection: (key) => domainNodeCollection.get(key),
      insertItemToTargetCollection: (key, value) => domainNodeCollection.set(key, value),
      tryDeleteItemFromTargetCollection: (key) => domainNodeCollection.delete(key),
      makeItemForTargetCollection: makeDomainModel,
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
    makeCollectionKey,
    makeDomainModel,
  }: {
    sourceCollection: Array<S>;
    domainNodeCollection: Set<D>;
    makeCollectionKey: IDomainNodeKeyFactory<S, D>;
    makeDomainModel: IMakeDomainModel<S, D>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionSize: () => domainNodeCollection.size,
      getTargetCollectionKeys: makeCollectionKey?.fromDomainModel ? () => CollectionUtils.Set.getKeys({ collection: domainNodeCollection, makeKey: makeCollectionKey.fromDomainModel! }) : undefined,
      makeDomainNodeKeyFromSourceNode: makeCollectionKey?.fromSourceNode,
      tryGetItemFromTargetCollection: makeCollectionKey?.fromDomainModel ? (key) => CollectionUtils.Set.tryGetItem({ collection: domainNodeCollection, makeKey: makeCollectionKey.fromDomainModel!, key }) : undefined,
      insertItemToTargetCollection: (key, value) => CollectionUtils.Set.insertItem({ collection: domainNodeCollection, key, value }),
      tryDeleteItemFromTargetCollection: makeCollectionKey?.fromDomainModel
        ? (key) => CollectionUtils.Set.tryDeleteItem({ collection: domainNodeCollection, makeKey: makeCollectionKey.fromDomainModel!, key })
        : undefined,
      makeItemForTargetCollection: makeDomainModel,
      trySyncElement: ({ sourceElementKey, sourceElementVal, targetElementKey, targetElementVal }) =>
        this.trySynchronizeNode({
          sourceNodeKind: 'arrayElement',
          sourceNodeKey: sourceElementKey,
          sourceNodeVal: sourceElementVal,
          domainNodeKey: targetElementKey,
          domainNodeVal: targetElementVal,
          tryUpdateDomainNode: (key, value) => CollectionUtils.Set.tryUpdateItem({ collection: domainNodeCollection, makeKey: makeCollectionKey.fromDomainModel!, value }),
        }),
    });
  }

  /**
   *
   */
  private synchronizeDomainArray<S, D>({
    sourceCollection,
    domainNodeCollection,
    makeCollectionKey,
    makeDomainModel,
  }: {
    sourceCollection: Array<S>;
    domainNodeCollection: Array<any>;
    makeCollectionKey: IDomainNodeKeyFactory<S, D>;
    makeDomainModel: IMakeDomainModel<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionSize: () => domainNodeCollection.length,
      getTargetCollectionKeys: makeCollectionKey?.fromDomainModel ? () => CollectionUtils.Array.getKeys({ collection: domainNodeCollection, makeKey: makeCollectionKey.fromDomainModel! }) : undefined,
      makeDomainNodeKeyFromSourceNode: makeCollectionKey?.fromSourceNode,
      makeItemForTargetCollection: makeDomainModel,
      tryGetItemFromTargetCollection: makeCollectionKey?.fromDomainModel ? (key) => CollectionUtils.Array.getItem({ collection: domainNodeCollection, makeKey: makeCollectionKey?.fromDomainModel!, key }) : undefined,
      insertItemToTargetCollection: (key, value) => CollectionUtils.Array.insertItem({ collection: domainNodeCollection, key, value }),
      tryDeleteItemFromTargetCollection: makeCollectionKey?.fromDomainModel ? (key) => CollectionUtils.Array.deleteItem({ collection: domainNodeCollection, makeKey: makeCollectionKey.fromDomainModel!, key }) : undefined,
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
      logger.warn('smartSync - sourceObject or domainModel was null. Exiting', { rootSourceNode, rootSyncableObject: rootDomainNode });
      return;
    }

    logger.trace('smartSync - entering action', { rootSourceNode, rootSyncableObject: rootDomainNode });
    this.trySynchronizeObject({ sourceObjectPath: '', sourceObject: rootSourceNode, domainModel: rootDomainNode });
    logger.trace('smartSync - action completed', { rootSourceNode, rootSyncableObject: rootDomainNode });
  }
}
