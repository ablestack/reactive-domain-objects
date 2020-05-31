import { runInAction } from 'mobx';
import { CollectionUtils, comparers, IEqualityComparer, IGraphSynchronizer, IGraphSyncOptions, IPropertySyncOptions, IsICustomEqualityDomainObject, SyncUtils } from '.';
import { Logger } from './logger';
import {
  DomainNodeType,
  DomainNodeTypeInfo,
  IGlobalPropertyNameTransformation,
  IMakeDomainObject,
  IMakeKey,
  IsICustomSyncDomainObject,
  IsIDomainObjectFactory,
  IsISyncableCollection,
  ISyncableCollection,
  JavaScriptBuiltInType,
  JsonNodeKind,
  SourceNodeType,
  SourceNodeTypeInfo,
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
  private _globalPropertyNameTransformations: IGlobalPropertyNameTransformation | undefined;
  private _sourcePathMap: Map<string, IPropertySyncOptions<any, any>>;
  private _sourceTypeMap: Map<string, IPropertySyncOptions<any, any>>;
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

  private getPathMapSyncOptions(): IPropertySyncOptions<any, any> | undefined {
    const currentPath = this.getSourceObjectPath();
    return this._sourcePathMap.get(currentPath);
  }

  private getTypeMapSyncOptions(): IPropertySyncOptions<any, any> | undefined {
    const currentPath = this.getSourceObjectPath();
    return this._sourceTypeMap.get(currentPath);
  }

  // ------------------------------------------------------------------------------------------------------------------
  // CONSTRUCTOR
  // ------------------------------------------------------------------------------------------------------------------
  constructor(options?: IGraphSyncOptions) {
    this._defaultEqualityComparer = options?.defaultEqualityChecker || comparers.apollo;
    this._globalPropertyNameTransformations = options?.globalPropertyNameTransformations;
    this._sourcePathMap = new Map<string, IPropertySyncOptions<any, any>>();
    this._sourceTypeMap = new Map<string, IPropertySyncOptions<any, any>>();

    if (options?.sourcePathMap) {
      options?.sourcePathMap.forEach((sourcePathMapItem) => {
        this._sourcePathMap.set(sourcePathMapItem.path, sourcePathMapItem.options);
      });
    }

    if (options?.sourceTypeMap) {
      options?.sourceTypeMap.forEach((sourcePathMapItem) => {
        this._sourcePathMap.set(sourcePathMapItem.typeName, sourcePathMapItem.options);
      });
    }
  }

  // ------------------------------------------------------------------------------------------------------------------
  // PRIVATE METHODS
  // ------------------------------------------------------------------------------------------------------------------

  /**
   *
   */
  private trySynchronizeObject<S extends Record<string, any>, D extends Record<string, any>>({ key, sourceObject, domainObject }: { key: string; sourceObject: S; domainObject: D }): boolean {
    let changed = false;

    // Loop properties
    for (const sourcePropKey of Object.keys(sourceObject)) {
      // Set Destination Prop Key, and if not found, fall back to name with prefix if supplied
      let domainPropKey = this._globalPropertyNameTransformations?.makePropertyName ? this._globalPropertyNameTransformations?.makePropertyName(sourcePropKey) : sourcePropKey;
      if (!(domainPropKey in domainObject) && this._globalPropertyNameTransformations?.tryStandardPostfix) {
        const domainPropKeyWithPostfix = `${domainPropKey}${this._globalPropertyNameTransformations.tryStandardPostfix}`;
        logger.trace(`domainPropKey '${domainPropKey}' not found in domainObject. Trying '${domainPropKeyWithPostfix}' `);
        domainPropKey = domainPropKeyWithPostfix;
      }

      // Check to see if key exists
      if (!(domainPropKey in domainObject)) {
        logger.trace(`domainPropKey '${domainPropKey}' not found in domainObject. Skipping property`);
        continue;
      }

      changed ==
        this.trySynchronizeNode({
          sourceNodeKind: 'objectProperty',
          sourceNodeKey: sourcePropKey,
          sourceNodeVal: sourceObject[sourcePropKey],
          domainNodeKey: domainPropKey,
          domainNodeVal: domainObject[domainPropKey],
          updateDomainNode: (key, value) => CollectionUtils.Record.updateItem({ collection: domainObject, key, value }),
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
    updateDomainNode,
  }: {
    sourceNodeKind: JsonNodeKind;
    sourceNodeKey: string;
    sourceNodeVal: any;
    domainNodeKey: string;
    domainNodeVal: any;
    updateDomainNode: (key: string, value: any) => void;
  }): boolean {
    this.addSourceNodeToPath(sourceNodeKey, sourceNodeKind);

    // setup
    let changed = false;
    const sourceNodeTypeInfo = this.getSourceNodeType(sourceNodeVal);
    const domainNodeTypeInfo = this.getDomainNodeType(domainNodeVal);

    logger.trace(`synchronizeProperty (${domainNodeKey}) - enter`, { sourceNodeVal, domainNodeVal });

    //
    switch (sourceNodeTypeInfo.type) {
      case 'Primitive': {
        if (sourceNodeTypeInfo.builtInType !== domainNodeTypeInfo.builtInType && !!domainNodeTypeInfo.type) {
          throw Error(`For primitive types, the source type and the domain type must match. Source type: '${sourceNodeTypeInfo}', Domain type: ${domainNodeTypeInfo}`);
        }
        if (sourceNodeVal !== domainNodeVal) {
          logger.trace(`primitive value found in domainPropKey ${domainNodeKey}. Setting from old value to new value`, domainNodeVal, sourceNodeVal);
          updateDomainNode(domainNodeKey, sourceNodeVal);
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
        changed = this.trySynchronizeObjectState({ key: domainNodeKey, sourceObject: sourceNodeVal, domainObject: domainNodeVal });
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

    this.removeSourceNodeFromPath(sourceNodeKind);
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

    const { makeKeyFromSourceElement, makeKeyFromDomainItem, makeTargetCollectionItemFromSourceItem } = this.tryGetDomainCollectionProcessingMethods({ sourceCollection, domainCollection: domainNodeVal });

    // VALIDATE
    if (!makeKeyFromSourceElement) {
      throw new Error(
        `Could not find 'makeKeyFromSourceElement' (Path: '${this.getSourceObjectPath()}', type: ${domainNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IDomainObjectFactory on the contained type`,
      );
    }
    if (!makeTargetCollectionItemFromSourceItem) {
      throw new Error(
        `Could not find 'makeTargetCollectionItemFromSourceItem' (Path: '${this.getSourceObjectPath()}', type: ${domainNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IDomainObjectFactory on the contained type`,
      );
    }

    //
    // Execute the sync based on collection type
    //

    // ISYNCABLECOLLECTION SYNC
    if (domainNodeTypeInfo.type === 'ISyncableCollection') {
      return this.synchronizeISyncableCollection({ sourceCollection, domainNodeCollection: domainNodeVal as ISyncableCollection<any>, makeKeyFromSourceElement, makeTargetCollectionItemFromSourceItem });

      // MAP SYNC
    } else if (domainNodeTypeInfo.type === 'Map') {
      return this.synchronizeDomainMap({ sourceCollection, domainNodeCollection: domainNodeVal as Map<string, any>, makeKeyFromSourceElement, makeTargetCollectionItemFromSourceItem });

      // SET SYNC
    } else if (domainNodeTypeInfo.type === 'Set') {
      if (!makeKeyFromDomainItem)
        throw new Error(
          `Could not find 'makeKeyFromDomainItem' (Path: '${this.getSourceObjectPath()}', type: ${domainNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IDomainObjectFactory on the contained type`,
        );
      if (sourceCollection.length > NON_MAP_COLLECTION_SIZE_WARNING_THREASHOLD)
        logger.warn(
          `Path: '${this.getSourceObjectPath()}', collectionSize:${
            sourceCollection.lastIndexOf
          }, Domain collection type: Set - It is recommended that the Map or Custom collections types are used in the Domain objects for large collections. Set and Array collections will perform poorly with large collections`,
        );
      return this.synchronizeDomainSet({ sourceCollection, domainNodeCollection: domainNodeVal as Set<any>, makeKeyFromSourceElement, makeKeyFromDomainItem, makeTargetCollectionItemFromSourceItem });

      // ARRAY SYNC
    } else if (domainNodeTypeInfo.type === 'Array') {
      if (!makeKeyFromDomainItem)
        throw new Error(
          `Could not find 'makeKeyFromDomainItem' (Path: '${this.getSourceObjectPath()}', type: ${domainNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IDomainObjectFactory on the contained type`,
        );
      if (sourceCollection.length > 100)
        logger.warn(
          `Path: '${this.getSourceObjectPath()}', collectionSize:${
            sourceCollection.lastIndexOf
          }, Domain collection type: Array - It is recommended that the Map or Custom collections types are used in the Domain objects for large collections. Set and Array collections will perform poorly with large collections`,
        );
      return this.synchronizeDomainArray({ sourceCollection, domainNodeCollection: domainNodeVal as Array<any>, makeKeyFromSourceElement, makeKeyFromDomainItem, makeTargetCollectionItemFromSourceItem });
    }

    return false;
  }

  /** */
  private tryGetDomainCollectionProcessingMethods({ sourceCollection, domainCollection }: { sourceCollection: Array<any>; domainCollection: any }) {
    let makeKeyFromSourceElement: IMakeKey<any> | undefined;
    let makeKeyFromDomainItem: IMakeKey<any> | undefined;
    let makeTargetCollectionItemFromSourceItem: IMakeDomainObject<any, any> | undefined;

    const collectionElementType = this.getCollectionElementType({ sourceCollection, domainCollection });

    //
    // If types are primitive, provide default methods, else try and get from configuration
    //
    if (collectionElementType === 'primitive' || collectionElementType === 'empty') {
      makeKeyFromSourceElement = (primitive) => primitive.toString();
      makeKeyFromDomainItem = (primitive) => primitive.toString();
      makeTargetCollectionItemFromSourceItem = (primitive) => primitive;
    } else {
      const sourcePathMapOptions = this.getPathMapSyncOptions();
      const sourceTypeMapOptions = this.getPathMapSyncOptions();
      const typeOptions = IsIDomainObjectFactory(domainCollection)
        ? {
            makeKeyFromSourceElement: domainCollection.makeKeyFromSourceElement,
            makeKeyFromDomainItem: domainCollection.makeKeyFromDomainItem,
            makeTargetCollectionItemFromSourceItem: domainCollection.makeTargetCollectionItemFromSourceItem,
          }
        : { makeKeyFromSourceElement: undefined, makeKeyFromDomainItem: domainCollection.makeKeyFromDomainItem, makeTargetCollectionItemFromSourceItem: undefined };

      // GET CONFIG ITEM: makeKeyFromSourceElement
      makeKeyFromSourceElement = sourcePathMapOptions?.domainObjectCreation?.makeKeyFromSourceElement || sourceTypeMapOptions?.domainObjectCreation?.makeKeyFromSourceElement || typeOptions.makeKeyFromSourceElement;

      // GET CONFIG ITEM: makeKeyFromDomainItem
      makeKeyFromDomainItem = sourcePathMapOptions?.domainObjectCreation?.makeKeyFromDomainItem || sourceTypeMapOptions?.domainObjectCreation?.makeKeyFromDomainItem || typeOptions.makeKeyFromDomainItem;

      // GET CONFIG ITEM: makeTargetCollectionItemFromSourceItem
      makeTargetCollectionItemFromSourceItem =
        sourcePathMapOptions?.domainObjectCreation?.makeTargetCollectionItemFromSourceItem ||
        sourceTypeMapOptions?.domainObjectCreation?.makeTargetCollectionItemFromSourceItem ||
        typeOptions.makeTargetCollectionItemFromSourceItem;
    }

    return { makeKeyFromSourceElement, makeKeyFromDomainItem, makeTargetCollectionItemFromSourceItem };
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
    const sourceObjectPath = this.getSourceObjectPath();
    const lastSourceObject = this.getLastSourceObject();

    // Check if already in sync
    const isInSync = IsICustomEqualityDomainObject(domainObject) ? domainObject.isStateEqual(sourceObject, lastSourceObject) : this._defaultEqualityComparer(sourceObject, lastSourceObject);
    if (!isInSync) {
      // Synchronize
      if (IsICustomSyncDomainObject(domainObject)) {
        logger.trace(`synchronizeObjectState - ${sourceObjectPath} - custom state synchronizer found. Using to sync`);
        changed = domainObject.synchronizeState({ sourceObject, graphSynchronizer: this });
      } else {
        logger.trace(`synchronizeObjectState - ${sourceObjectPath} - no custom state synchronizer found. Using autoSync`);
        changed = this.trySynchronizeObject({ key, sourceObject: sourceObject, domainObject: domainObject });
      }
    } else {
      logger.trace(`synchronizeObjectState - ${sourceObjectPath} - already in sync. Skipping`);
    }

    return changed;
  }

  /**
   *
   */
  private synchronizeISyncableCollection<S>({
    sourceCollection,
    domainNodeCollection,
    makeKeyFromSourceElement,
    makeTargetCollectionItemFromSourceItem,
  }: {
    sourceCollection: Array<S>;
    domainNodeCollection: ISyncableCollection<any>;
    makeKeyFromSourceElement: IMakeKey<S>;
    makeTargetCollectionItemFromSourceItem: IMakeDomainObject<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionKeys: domainNodeCollection.getKeys,
      makeKeyFromSourceElement: makeKeyFromSourceElement,
      getItemFromTargetCollection: (key) => domainNodeCollection.getItemFromTargetCollection(key),
      insertItemToTargetCollection: (key, value) => domainNodeCollection.insertItemToTargetCollection(key, value),
      deleteItemFromTargetCollection: (key) => domainNodeCollection.deleteItemFromTargetCollection(key),
      makeTargetCollectionItemFromSourceItem: makeTargetCollectionItemFromSourceItem,
      trySyncElement: ({ sourceElementKey, sourceElementVal, targetElementKey, targetElementVal }) =>
        this.trySynchronizeNode({
          sourceNodeKind: 'arrayElement',
          sourceNodeKey: sourceElementKey,
          sourceNodeVal: sourceElementVal,
          domainNodeKey: targetElementKey,
          domainNodeVal: targetElementVal,
          updateDomainNode: (key, value) => domainNodeCollection.updateItemInTargetCollection(key, value),
        }),
    });
  }

  /**
   *
   */
  private synchronizeDomainMap<S>({
    sourceCollection,
    domainNodeCollection,
    makeKeyFromSourceElement,
    makeTargetCollectionItemFromSourceItem,
  }: {
    sourceCollection: Array<S>;
    domainNodeCollection: Map<string, S>;
    makeKeyFromSourceElement: IMakeKey<S>;
    makeTargetCollectionItemFromSourceItem: IMakeDomainObject<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionKeys: () => Array.from(domainNodeCollection.keys()),
      makeKeyFromSourceElement: makeKeyFromSourceElement,
      getItemFromTargetCollection: (key) => domainNodeCollection.get(key),
      insertItemToTargetCollection: (key, value) => domainNodeCollection.set(key, value),
      deleteItemFromTargetCollection: (key) => domainNodeCollection.delete(key),
      makeTargetCollectionItemFromSourceItem: makeTargetCollectionItemFromSourceItem,
      trySyncElement: ({ sourceElementKey, sourceElementVal, targetElementKey, targetElementVal }) =>
        this.trySynchronizeNode({
          sourceNodeKind: 'arrayElement',
          sourceNodeKey: sourceElementKey,
          sourceNodeVal: sourceElementVal,
          domainNodeKey: targetElementKey,
          domainNodeVal: targetElementVal,
          updateDomainNode: (key, value) => domainNodeCollection.set(key, value),
        }),
    });
  }

  /**
   *
   */
  private synchronizeDomainSet<S>({
    sourceCollection,
    domainNodeCollection,
    makeKeyFromSourceElement,
    makeKeyFromDomainItem,
    makeTargetCollectionItemFromSourceItem,
  }: {
    sourceCollection: Array<S>;
    domainNodeCollection: Set<S>;
    makeKeyFromSourceElement: IMakeKey<S>;
    makeKeyFromDomainItem: IMakeKey<S>;
    makeTargetCollectionItemFromSourceItem: IMakeDomainObject<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionKeys: () => CollectionUtils.Set.getKeys({ collection: domainNodeCollection, makeKey: makeKeyFromDomainItem }),
      makeKeyFromSourceElement: makeKeyFromSourceElement,
      getItemFromTargetCollection: (key) => CollectionUtils.Set.getItem({ collection: domainNodeCollection, makeKey: makeKeyFromDomainItem, key }),
      insertItemToTargetCollection: (key, value) => CollectionUtils.Set.insertItem({ collection: domainNodeCollection, key, value }),
      deleteItemFromTargetCollection: (key) => CollectionUtils.Set.deleteItem({ collection: domainNodeCollection, makeKey: makeKeyFromDomainItem, key }),
      makeTargetCollectionItemFromSourceItem: makeTargetCollectionItemFromSourceItem,
      trySyncElement: ({ sourceElementKey, sourceElementVal, targetElementKey, targetElementVal }) =>
        this.trySynchronizeNode({
          sourceNodeKind: 'arrayElement',
          sourceNodeKey: sourceElementKey,
          sourceNodeVal: sourceElementVal,
          domainNodeKey: targetElementKey,
          domainNodeVal: targetElementVal,
          updateDomainNode: (key, value) => CollectionUtils.Set.updateItem({ collection: domainNodeCollection, makeKey: makeKeyFromDomainItem, value }),
        }),
    });
  }

  /**
   *
   */
  private synchronizeDomainArray<S>({
    sourceCollection,
    domainNodeCollection,
    makeKeyFromSourceElement,
    makeKeyFromDomainItem,
    makeTargetCollectionItemFromSourceItem,
  }: {
    sourceCollection: Array<S>;
    domainNodeCollection: Array<any>;
    makeKeyFromSourceElement: IMakeKey<S>;
    makeKeyFromDomainItem: IMakeKey<S>;
    makeTargetCollectionItemFromSourceItem: IMakeDomainObject<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionKeys: () => CollectionUtils.Array.getKeys({ collection: domainNodeCollection, makeKey: makeKeyFromDomainItem }),
      makeKeyFromSourceElement,
      getItemFromTargetCollection: (key) => CollectionUtils.Array.getItem({ collection: domainNodeCollection, makeKey: makeKeyFromDomainItem, key }),
      insertItemToTargetCollection: (key, value) => CollectionUtils.Array.insertItem({ collection: domainNodeCollection, key, value }),
      deleteItemFromTargetCollection: (key) => CollectionUtils.Array.deleteItem({ collection: domainNodeCollection, makeKey: makeKeyFromDomainItem, key }),
      makeTargetCollectionItemFromSourceItem: makeTargetCollectionItemFromSourceItem,
      trySyncElement: ({ sourceElementKey, sourceElementVal, targetElementKey, targetElementVal }) =>
        this.trySynchronizeNode({
          sourceNodeKind: 'arrayElement',
          sourceNodeKey: sourceElementKey,
          sourceNodeVal: sourceElementVal,
          domainNodeKey: targetElementKey,
          domainNodeVal: targetElementVal,
          updateDomainNode: (key, value) => CollectionUtils.Array.insertItem({ collection: domainNodeCollection, key, value }),
        }),
    });
  }

  // ------------------------------------------------------------------------------------------------------------------
  // PUBLIC METHODS
  // ------------------------------------------------------------------------------------------------------------------

  /**
   *
   */
  public synchronize<S extends Record<string, any>, D extends Record<string, any>>({ rootsourceObject, rootDomainObject }: { rootsourceObject: S; rootDomainObject: D }) {
    if (!rootsourceObject || !rootDomainObject) {
      logger.warn('synchronize - sourceObject or domainObject was null. Exiting', { rootsourceObject, rootSyncableObject: rootDomainObject });
      return;
    }

    logger.trace('synchronize - entering action', { rootsourceObject, rootSyncableObject: rootDomainObject });
    runInAction('trySynchronizeObject', () => {
      this.trySynchronizeObject({ key: 'root', sourceObject: rootsourceObject, domainObject: rootDomainObject });
    });
    logger.trace('synchronize - action completed', { rootsourceObject, rootSyncableObject: rootDomainObject });
  }
}
