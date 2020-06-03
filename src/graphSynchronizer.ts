import { runInAction } from 'mobx';
import { CollectionUtils, comparers, IEqualityComparer, IGraphSynchronizer, IGraphSyncOptions, INodeSyncOptions, IsICustomEqualityDomainModel, SyncUtils } from '.';
import { Logger } from './logger';
import {
  DomainNodeType,
  DomainNodeTypeInfo,
  IGlobalPropertyNameTransformation,
  IMakeDomainModel,
  IMakeKey,
  IsICustomSyncDomainModel,
  IsIDomainModelFactory,
  IsISyncableCollection,
  ISyncableCollection,
  JavaScriptBuiltInType,
  JsonNodeKind,
  SourceNodeType,
  SourceNodeTypeInfo,
  IDomainNodeKeyFactory,
} from './types';

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
  private _globalOptions: IGlobalPropertyNameTransformation | undefined;
  private _targetOptionsPathMap: Map<string, INodeSyncOptions<any, any>>;
  private _targetOptionsSelectorArray: Array<INodeSyncOptions<any, any>>;
  private _sourceObjectMap = new Map<string, any>();
  private _sourceNodeKeyChain = new Array<string>();
  private _sourceObjectKeyChain = new Array<string>();

  // ------------------------------------------------------------------------------------------------------------------
  // PRIVATE PROPERTIES
  // ------------------------------------------------------------------------------------------------------------------
  private addSourceNodeToPath(key: string, sourceNodeKind: JsonNodeKind) {
    logger.trace(`Adding SourceNode to path: ${this.getSourceNodePath()} + ${key} (${sourceNodeKind})`);
    this._sourceNodeKeyChain.push(key);
    if (sourceNodeKind === 'objectProperty') this._sourceObjectKeyChain.push(key);
  }

  private removeSourceNodeFromPath(sourceNodeKind: JsonNodeKind) {
    const key = this._sourceNodeKeyChain.pop();
    logger.trace(`Removing SourceNode from path: ${this.getSourceNodePath()} - ${key} (${sourceNodeKind})`);
    if (sourceNodeKind === 'objectProperty') this._sourceObjectKeyChain.pop();
  }

  // NodePath is used for persisting previous source state. It is unique per node, but dynamic (thus not predictable)
  private getSourceNodePath(): string {
    return this._sourceNodeKeyChain.join('.');
  }

  // ObjectPath is used for configuration generated options. It is the node path, with the collection keys skipped. It is static, but  not unique per node
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
    this._defaultEqualityComparer = options?.defaultEqualityChecker || comparers.apollo;
    this._globalOptions = options?.globalOptions;
    this._targetOptionsPathMap = new Map<string, INodeSyncOptions<any, any>>();
    this._targetOptionsSelectorArray = new Array<INodeSyncOptions<any, any>>();

    if (options?.targetedOptions) {
      options?.targetedOptions.forEach((targetedOptionsItem) => {
        if (targetedOptionsItem.selector.path) this._targetOptionsPathMap.set(targetedOptionsItem.selector.path, targetedOptionsItem);
        this._targetOptionsSelectorArray.push(targetedOptionsItem);
      });
    }
  }

  // ------------------------------------------------------------------------------------------------------------------
  // PRIVATE METHODS
  // ------------------------------------------------------------------------------------------------------------------

  /**
   *
   */
  private trySynchronizeObject<S extends Record<string, any>, D extends Record<string, any>>({ key, sourceObject, domainModel }: { key: string; sourceObject: S; domainModel: D }): boolean {
    let changed = false;

    // Loop properties
    for (const sourcePropKey of Object.keys(sourceObject)) {
      // Set Destination Prop Key, and if not found, fall back to name with prefix if supplied
      let domainPropKey = this._globalOptions?.makePropertyName ? this._globalOptions?.makePropertyName(sourcePropKey) : sourcePropKey;
      if (!(domainPropKey in domainModel) && this._globalOptions?.tryStandardPostfix) {
        const domainPropKeyWithPostfix = `${domainPropKey}${this._globalOptions.tryStandardPostfix}`;
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
          sourceNodeVal: sourceObject[sourcePropKey],
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

    const { makeDomainNodeKey, makeDomainModel } = this.tryGetDomainCollectionProcessingMethods({ sourceCollection, domainCollection: domainNodeVal });

    // VALIDATE
    if (sourceCollection.length > 0 && !makeDomainNodeKey?.fromSourceNode) {
      throw new Error(
        `Could not find 'makeDomainNodeKey?.fromSourceNode)' (Path: '${this.getSourceObjectPath()}', type: ${domainNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IDomainModelFactory on the contained type`,
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

      return this.synchronizeISyncableCollection({ sourceCollection, domainNodeCollection, makeDomainNodeKey: makeDomainNodeKey!, makeDomainModel: makeDomainModel! });

      //-----------------------------------------------------
      // MAP SYNC
      //-----------------------------------------------------
    } else if (domainNodeTypeInfo.type === 'Map') {
      const domainNodeCollection = domainNodeVal as Map<string, any>;

      if (sourceCollection.length === 0 && domainNodeCollection.size > 0) {
        domainNodeCollection.clear();
      }

      return this.synchronizeDomainMap({ sourceCollection, domainNodeCollection, makeDomainNodeKey: makeDomainNodeKey!, makeDomainModel: makeDomainModel! });

      //-----------------------------------------------------
      // SET SYNC
      //-----------------------------------------------------
    } else if (domainNodeTypeInfo.type === 'Set') {
      const domainNodeCollection = domainNodeVal as Set<any>;

      if (sourceCollection.length === 0 && domainNodeCollection.size > 0) {
        domainNodeCollection.clear();
      }

      if (domainNodeCollection.size > 0 && !makeDomainNodeKey?.fromDomainModel)
        throw new Error(
          `Could not find '!makeDomainNodeKey?.fromDomainModel' (Path: '${this.getSourceObjectPath()}', type: ${domainNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IDomainModelFactory on the contained type`,
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
        makeDomainNodeKey: makeDomainNodeKey!,
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

      if (domainNodeCollection.length > 0 && !makeDomainNodeKey?.fromDomainModel)
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
        makeDomainNodeKey: makeDomainNodeKey!,
        makeDomainModel: makeDomainModel!,
      });
    }

    return false;
  }

  /** */
  private tryGetDomainCollectionProcessingMethods({ sourceCollection, domainCollection }: { sourceCollection: Array<any>; domainCollection: any }) {
    let makeDomainNodeKey: IDomainNodeKeyFactory<any, any> | undefined;
    let makeDomainModel: IMakeDomainModel<any, any> | undefined;

    const collectionElementType = this.getCollectionElementType({ sourceCollection, domainCollection });

    //
    // If types are primitive, provide default methods, else try and get from configuration
    //
    if (collectionElementType === 'primitive' || collectionElementType === 'empty') {
      makeDomainNodeKey = { fromSourceNode: (primitive) => primitive.toString(), fromDomainModel: (primitive) => primitive.toString() };
      makeDomainModel = (primitive) => primitive;
    } else {
      const targetDerivedOptions = this.getMatchingOptionsForCollectionNode({ sourceCollection, domainCollection });
      const typeDerivedOptions = IsIDomainModelFactory(domainCollection)
        ? { makeDomainNodeKey: domainCollection.makeDomainNodeKey, makeDomainModel: domainCollection.makeDomainModel }
        : { makeDomainNodeKeyFromSourceNode: undefined, makeDomainNodeKeyFromDomainModel: domainCollection.makeDomainNodeKeyFromDomainModel, makeDomainModel: undefined };

      // GET CONFIG ITEM: makeDomainNodeKeyFromSourceNode
      makeDomainNodeKey = targetDerivedOptions?.domainModelCreation?.makeDomainNodeKey || typeDerivedOptions.makeDomainNodeKey || this.tryMakeDefaultKeyMaker({ sourceCollection, domainCollection });

      // GET CONFIG ITEM: makeDomainModel
      makeDomainModel = targetDerivedOptions?.domainModelCreation?.makeDomainModel || targetDerivedOptions?.domainModelCreation?.makeDomainModel || typeDerivedOptions.makeDomainModel;
    }

    return { makeDomainNodeKey, makeDomainModel };
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
      options = this._targetOptionsSelectorArray.find((targetOptionsItem) => (targetOptionsItem.selector.matcher ? targetOptionsItem.selector.matcher(firstItemInSourceCollection) : false));
      if (options) return options;
    }

    // Try and get options from Domain collection
    // ASSUMPTION - all supported collection types implement Iterable<>
    const firstItemInDomainCollection = domainCollection[Symbol.iterator]().next().value;
    options = this._targetOptionsSelectorArray.find((targetOptionsItem) => (targetOptionsItem.selector.matcher ? targetOptionsItem.selector.matcher(firstItemInDomainCollection) : false));
    return options;
  }

  /** */
  private tryMakeDefaultKeyMaker({ sourceCollection, domainCollection }: { sourceCollection: Array<any>; domainCollection: Iterable<any> }): IDomainNodeKeyFactory<any, any> | undefined {
    let makeDomainNodeKey: IDomainNodeKeyFactory<any, any> = {} as any;

    // Try and get options from source collection
    if (sourceCollection && sourceCollection.length > 0) {
      const firstItemInSourceCollection = sourceCollection[0];
      if (firstItemInSourceCollection && firstItemInSourceCollection.id) {
        makeDomainNodeKey.fromSourceNode = (sourceNode: any) => sourceNode.id;
      }
    }

    // Try and get options from domain collection
    const firstItemInDomainCollection = domainCollection[Symbol.iterator]().next().value;
    if (firstItemInDomainCollection) {
      let idKey = 'id';
      let hasIdKey = idKey in firstItemInDomainCollection;

      // TODO - test this
      // if (!hasIdKey && this._globalOptions?.tryStandardPostfix) {
      //   idKey = `${idKey}${this._globalOptions.tryStandardPostfix}`;
      //   hasIdKey = idKey in firstItemInDomainCollection;
      // }

      if (hasIdKey) {
        makeDomainNodeKey.fromDomainModel = (domainNode: any) => domainNode.id;
      }
    }

    // TODO - allow to return if fromDomainModel is null, even though this is not allowed in user supplied options
    //  When defaultKeyMaker, the code can handle a special case where fromDomainModel is null (when no items in domain collection)

    if (!makeDomainNodeKey || !makeDomainNodeKey.fromSourceNode) return undefined;
    else return makeDomainNodeKey;
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
        changed = this.trySynchronizeObject({ key, sourceObject: sourceObject, domainModel: domainModel });
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
    makeDomainNodeKey,
    makeDomainModel,
  }: {
    sourceCollection: Array<S>;
    domainNodeCollection: ISyncableCollection<any>;
    makeDomainNodeKey: IDomainNodeKeyFactory<S, D>;
    makeDomainModel: IMakeDomainModel<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionSize: () => domainNodeCollection.size,
      getTargetCollectionKeys: domainNodeCollection.getKeys,
      makeDomainNodeKeyFromSourceNode: makeDomainNodeKey?.fromSourceNode!,
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
    makeDomainNodeKey,
    makeDomainModel,
  }: {
    sourceCollection: Array<S>;
    domainNodeCollection: Map<string, S>;
    makeDomainNodeKey: IDomainNodeKeyFactory<S, D>;
    makeDomainModel: IMakeDomainModel<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionSize: () => domainNodeCollection.size,
      getTargetCollectionKeys: () => Array.from(domainNodeCollection.keys()),
      makeDomainNodeKeyFromSourceNode: makeDomainNodeKey?.fromSourceNode,
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
    makeDomainNodeKey,
    makeDomainModel,
  }: {
    sourceCollection: Array<S>;
    domainNodeCollection: Set<D>;
    makeDomainNodeKey: IDomainNodeKeyFactory<S, D>;
    makeDomainModel: IMakeDomainModel<S, D>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionSize: () => domainNodeCollection.size,
      getTargetCollectionKeys: makeDomainNodeKey?.fromDomainModel ? () => CollectionUtils.Set.getKeys({ collection: domainNodeCollection, makeKey: makeDomainNodeKey.fromDomainModel! }) : undefined,
      makeDomainNodeKeyFromSourceNode: makeDomainNodeKey?.fromSourceNode,
      tryGetItemFromTargetCollection: makeDomainNodeKey?.fromDomainModel ? (key) => CollectionUtils.Set.tryGetItem({ collection: domainNodeCollection, makeKey: makeDomainNodeKey.fromDomainModel!, key }) : undefined,
      insertItemToTargetCollection: (key, value) => CollectionUtils.Set.insertItem({ collection: domainNodeCollection, key, value }),
      tryDeleteItemFromTargetCollection: makeDomainNodeKey?.fromDomainModel
        ? (key) => CollectionUtils.Set.tryDeleteItem({ collection: domainNodeCollection, makeKey: makeDomainNodeKey.fromDomainModel!, key })
        : undefined,
      makeItemForTargetCollection: makeDomainModel,
      trySyncElement: ({ sourceElementKey, sourceElementVal, targetElementKey, targetElementVal }) =>
        this.trySynchronizeNode({
          sourceNodeKind: 'arrayElement',
          sourceNodeKey: sourceElementKey,
          sourceNodeVal: sourceElementVal,
          domainNodeKey: targetElementKey,
          domainNodeVal: targetElementVal,
          tryUpdateDomainNode: (key, value) => CollectionUtils.Set.tryUpdateItem({ collection: domainNodeCollection, makeKey: makeDomainNodeKey.fromDomainModel!, value }),
        }),
    });
  }

  /**
   *
   */
  private synchronizeDomainArray<S, D>({
    sourceCollection,
    domainNodeCollection,
    makeDomainNodeKey,
    makeDomainModel,
  }: {
    sourceCollection: Array<S>;
    domainNodeCollection: Array<any>;
    makeDomainNodeKey: IDomainNodeKeyFactory<S, D>;
    makeDomainModel: IMakeDomainModel<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionSize: () => domainNodeCollection.length,
      getTargetCollectionKeys: () => CollectionUtils.Array.getKeys({ collection: domainNodeCollection, makeKey: makeDomainNodeKey.fromSourceNode! }),
      makeDomainNodeKeyFromSourceNode: makeDomainNodeKey?.fromSourceNode,
      makeItemForTargetCollection: makeDomainModel,
      tryGetItemFromTargetCollection: makeDomainNodeKey?.fromDomainModel ? (key) => CollectionUtils.Array.getItem({ collection: domainNodeCollection, makeKey: makeDomainNodeKey?.fromDomainModel!, key }) : undefined,
      insertItemToTargetCollection: (key, value) => CollectionUtils.Array.insertItem({ collection: domainNodeCollection, key, value }),
      tryDeleteItemFromTargetCollection: makeDomainNodeKey?.fromDomainModel ? (key) => CollectionUtils.Array.deleteItem({ collection: domainNodeCollection, makeKey: makeDomainNodeKey.fromDomainModel!, key }) : undefined,
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
  public synchronize<S extends Record<string, any>, D extends Record<string, any>>({ rootSourceNode, rootDomainNode }: { rootSourceNode: S; rootDomainNode: D }) {
    if (!rootSourceNode || !rootDomainNode) {
      logger.warn('synchronize - sourceObject or domainModel was null. Exiting', { rootSourceNode, rootSyncableObject: rootDomainNode });
      return;
    }

    logger.trace('synchronize - entering action', { rootSourceNode, rootSyncableObject: rootDomainNode });
    this.trySynchronizeObject({ key: 'root', sourceObject: rootSourceNode, domainModel: rootDomainNode });
    logger.trace('synchronize - action completed', { rootSourceNode, rootSyncableObject: rootDomainNode });
  }
}
