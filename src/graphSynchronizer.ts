import { runInAction } from 'mobx';
import { CollectionUtils, comparers, IEqualityComparer, IGraphSynchronizer, IGraphSyncOptions, IPropertySyncOptions, IsICustomEqualityDomainObject, SyncUtils } from '.';
import { Logger } from './logger';
import {
  IGlobalPropertyNameTransformation,
  IMakeDomainObject,
  IMakeKey,
  IsICustomSyncDomainObject,
  IsIDomainObjectFactory,
  IsISyncableCollection,
  ISyncableCollection,
  JavaScriptBuiltInType,
  JsonNodeType,
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
  private addSourceNodeToPath(key: string, sourceNodeType: JsonNodeType) {
    logger.trace(`Adding SourceNode to path: ${this.getSourceNodePath()} + ${key} (${sourceNodeType})`);
    this._sourceNodeKeyChain.push(key);
    if (sourceNodeType === 'objectProperty') this._sourceObjectKeyChain.push(key);
  }

  private removeSourceNodeFromPath(sourceNodeType: JsonNodeType) {
    const key = this._sourceNodeKeyChain.pop();
    logger.trace(`Removing SourceNode from path: ${this.getSourceNodePath()} - ${key} (${sourceNodeType})`);
    if (sourceNodeType === 'objectProperty') this._sourceObjectKeyChain.pop();
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

  /** */
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
          sourceNodeType: 'objectProperty',
          sourceNodeKey: sourcePropKey,
          sourceNodeVal: sourceObject[sourcePropKey],
          domainNodeKey: domainPropKey,
          domainNodeVal: domainObject[domainPropKey],
          updateDomainNode: (key, value) => CollectionUtils.Record.updateItem({ collection: domainObject, key, value }),
        }) || changed;
    }

    return changed;
  }

  /** */
  private trySynchronizeNode({
    sourceNodeType,
    sourceNodeKey,
    sourceNodeVal,
    domainNodeKey,
    domainNodeVal,
    updateDomainNode,
  }: {
    sourceNodeType: JsonNodeType;
    sourceNodeKey: string;
    sourceNodeVal: any;
    domainNodeKey: string;
    domainNodeVal: any;
    updateDomainNode: (key: string, value: any) => void;
  }): boolean {
    this.addSourceNodeToPath(sourceNodeKey, sourceNodeType);

    // setup
    let changed = false;
    const sourcePropType = toString.call(sourceNodeVal) as JavaScriptBuiltInType;
    const domainPropType = toString.call(domainNodeVal) as JavaScriptBuiltInType;

    logger.trace(`synchronizeProperty (${domainNodeKey}) - enter`, { sourceNodeVal, domainNodeVal });

    //
    switch (sourcePropType) {
      case '[object Boolean]':
      case '[object Date]':
      case '[object Number]':
      case '[object String]': {
        if (sourcePropType !== domainPropType && domainPropType !== '[object Undefined]')
          throw Error(`For primitive types, the source type and the domain type must match. Source type: '${sourcePropType}', Domain type: ${domainPropType}`);
        if (sourceNodeVal !== domainNodeVal) {
          logger.trace(`primitive value found in domainPropKey ${domainNodeKey}. Setting from old value to new value`, domainNodeVal, sourceNodeVal);
          updateDomainNode(domainNodeKey, sourceNodeVal);
          changed = true;
        }
        break;
      }
      case '[object Object]': {
        if (domainPropType !== '[object Object]') {
          throw Error(`[${this.getSourceNodePath()}] Object source types can only be synchronized to Object destination types, and must not be null. Source type: '${sourcePropType}', Domain type: ${domainPropType} `);
        }
        changed = this.trySynchronizeObjectState({ key: domainNodeKey, sourceObject: sourceNodeVal, domainObject: domainNodeVal });
        break;
      }
      case '[object Array]': {
        changed = this.synchronizeSourceArray({ domainPropType, sourcePropType, domainPropVal: domainNodeVal, sourceCollection: sourceNodeVal });
        break;
      }
      default: {
        logger.trace(`Skipping item ${this.getSourceNodePath()}. Unable to reconcile synchronization for types - sourcePropType: ${sourcePropType}), domainPropType: ${domainPropType}`);
        break;
      }
    }

    this.removeSourceNodeFromPath(sourceNodeType);
    return changed;
  }

  /** */
  private synchronizeSourceArray({ domainPropType, sourcePropType, domainPropVal, sourceCollection }: { domainPropType: string; sourcePropType: string; domainPropVal: any; sourceCollection: Array<any> }): boolean {
    if (domainPropType === '[object Undefined]') throw Error(`Destination types must not be null when transforming Array source type. Source type: '${sourcePropType}', Domain type: ${domainPropType} `);

    const sourcePathMapOptions = this.getPathMapSyncOptions();
    const sourceTypeMapOptions = this.getPathMapSyncOptions();
    const typeOptions = IsIDomainObjectFactory(domainPropVal)
      ? {
          makeKeyFromSourceElement: domainPropVal.makeKeyFromSourceElement,
          makeKeyFromDomainItem: domainPropVal.makeKeyFromDomainItem,
          makeTargetCollectionItemFromSourceItem: domainPropVal.makeTargetCollectionItemFromSourceItem,
        }
      : { makeKeyFromSourceElement: undefined, makeKeyFromDomainItem: domainPropVal.makeKeyFromDomainItem, makeTargetCollectionItemFromSourceItem: undefined };

    // GET CONFIG ITEM: makeKeyFromCourseElement
    let makeKeyFromSourceElement: IMakeKey<any> | undefined =
      sourcePathMapOptions?.domainObjectCreation?.makeKeyFromSourceElement || sourceTypeMapOptions?.domainObjectCreation?.makeKeyFromSourceElement || typeOptions.makeKeyFromSourceElement;

    // GET CONFIG ITEM: makeKeyFromDomainItem
    let makeKeyFromDomainItem: IMakeKey<any> | undefined =
      sourcePathMapOptions?.domainObjectCreation?.makeKeyFromDomainItem || sourceTypeMapOptions?.domainObjectCreation?.makeKeyFromDomainItem || typeOptions.makeKeyFromDomainItem;

    // GET CONFIG ITEM: makeTargetCollectionItemFromSourceItem
    let makeTargetCollectionItemFromSourceItem: IMakeDomainObject<any, any> | undefined =
      sourcePathMapOptions?.domainObjectCreation?.makeTargetCollectionItemFromSourceItem ||
      sourceTypeMapOptions?.domainObjectCreation?.makeTargetCollectionItemFromSourceItem ||
      typeOptions.makeTargetCollectionItemFromSourceItem;

    // VALIDATE
    if (!makeKeyFromSourceElement) throw new Error(`Could not find 'makeKeyFromSourceElement' function in options or type. Path: ${this.getSourceObjectPath()}, type: ${domainPropType}`);
    if (!makeTargetCollectionItemFromSourceItem) throw new Error(`Could not find 'makeTargetCollectionItemFromSourceItem' function in options or type. Path: ${this.getSourceObjectPath()}, type: ${domainPropType}`);

    //
    // Execute the sync based on type
    //

    // ISYNCABLECOLLECTION SYNC
    if (IsISyncableCollection(domainPropVal)) {
      return this.synchronizeISyncableCollection({ sourceCollection, domainPropCollection: domainPropVal as ISyncableCollection<any>, makeKeyFromSourceElement, makeTargetCollectionItemFromSourceItem });

      // MAP SYNC
    } else if (domainPropType === '[object Map]') {
      return this.synchronizeDomainMap({ sourceCollection, domainPropCollection: domainPropVal as Map<string, any>, makeKeyFromSourceElement, makeTargetCollectionItemFromSourceItem });

      // SET SYNC
    } else if (domainPropType === '[object Set]') {
      if (!makeKeyFromDomainItem) throw new Error(`Could not find 'makeKeyFromDomainItem' function in options or type. Path: ${this.getSourceObjectPath()}, type: ${domainPropType}`);
      if (sourceCollection.length > NON_MAP_COLLECTION_SIZE_WARNING_THREASHOLD)
        logger.warn(
          `Path: ${this.getSourceObjectPath()}, collectionSize:${
            sourceCollection.lastIndexOf
          }, Domain collection type: Set - It is recommended that the Map or Custom collections types are used in the Domain objects for large collections. Set and Array collections will perform poorly with large collections`,
        );
      return this.synchronizeDomainSet({ sourceCollection, domainPropCollection: domainPropVal as Set<any>, makeKeyFromSourceElement, makeKeyFromDomainItem, makeTargetCollectionItemFromSourceItem });

      // ARRAY SYNC
    } else if (domainPropType === '[object Array]') {
      if (!makeKeyFromDomainItem) throw new Error(`Could not find 'makeKeyFromDomainItem' function in options or type. Path: ${this.getSourceObjectPath()}, type: ${domainPropType}`);
      if (sourceCollection.length > 100)
        logger.warn(
          `Path: ${this.getSourceObjectPath()}, collectionSize:${
            sourceCollection.lastIndexOf
          }, Domain collection type: Array - It is recommended that the Map or Custom collections types are used in the Domain objects for large collections. Set and Array collections will perform poorly with large collections`,
        );
      return this.synchronizeDomainArray({ sourceCollection, domainPropCollection: domainPropVal as Array<any>, makeKeyFromSourceElement, makeKeyFromDomainItem, makeTargetCollectionItemFromSourceItem });
    }

    return false;
  }

  /** */
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

  private synchronizeISyncableCollection<S>({
    sourceCollection,
    domainPropCollection,
    makeKeyFromSourceElement,
    makeTargetCollectionItemFromSourceItem,
  }: {
    sourceCollection: Array<S>;
    domainPropCollection: ISyncableCollection<any>;
    makeKeyFromSourceElement: IMakeKey<S>;
    makeTargetCollectionItemFromSourceItem: IMakeDomainObject<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionKeys: domainPropCollection.getKeys,
      makeKeyFromSourceElement: makeKeyFromSourceElement,
      getItemFromTargetCollection: (key) => domainPropCollection.getItemFromTargetCollection(key),
      insertItemToTargetCollection: (key, value) => domainPropCollection.insertItemToTargetCollection(key, value),
      deleteItemFromTargetCollection: (key) => domainPropCollection.deleteItemFromTargetCollection(key),
      makeTargetCollectionItemFromSourceItem: makeTargetCollectionItemFromSourceItem,
      trySyncElement: ({ sourceElementKey, sourceElementVal, targetElementKey, targetElementVal }) =>
        this.trySynchronizeNode({
          sourceNodeType: 'arrayElement',
          sourceNodeKey: sourceElementKey,
          sourceNodeVal: sourceElementVal,
          domainNodeKey: targetElementKey,
          domainNodeVal: targetElementVal,
          updateDomainNode: (key, value) => domainPropCollection.updateItemInTargetCollection(key, value),
        }),
    });
  }

  private synchronizeDomainMap<S>({
    sourceCollection,
    domainPropCollection,
    makeKeyFromSourceElement,
    makeTargetCollectionItemFromSourceItem,
  }: {
    sourceCollection: Array<S>;
    domainPropCollection: Map<string, S>;
    makeKeyFromSourceElement: IMakeKey<S>;
    makeTargetCollectionItemFromSourceItem: IMakeDomainObject<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionKeys: () => Array.from(domainPropCollection.keys()),
      makeKeyFromSourceElement: makeKeyFromSourceElement,
      getItemFromTargetCollection: (key) => domainPropCollection.get(key),
      insertItemToTargetCollection: (key, value) => domainPropCollection.set(key, value),
      deleteItemFromTargetCollection: (key) => domainPropCollection.delete(key),
      makeTargetCollectionItemFromSourceItem: makeTargetCollectionItemFromSourceItem,
      trySyncElement: ({ sourceElementKey, sourceElementVal, targetElementKey, targetElementVal }) =>
        this.trySynchronizeNode({
          sourceNodeType: 'arrayElement',
          sourceNodeKey: sourceElementKey,
          sourceNodeVal: sourceElementVal,
          domainNodeKey: targetElementKey,
          domainNodeVal: targetElementVal,
          updateDomainNode: (key, value) => domainPropCollection.set(key, value),
        }),
    });
  }

  private synchronizeDomainSet<S>({
    sourceCollection,
    domainPropCollection,
    makeKeyFromSourceElement,
    makeKeyFromDomainItem,
    makeTargetCollectionItemFromSourceItem,
  }: {
    sourceCollection: Array<S>;
    domainPropCollection: Set<S>;
    makeKeyFromSourceElement: IMakeKey<S>;
    makeKeyFromDomainItem: IMakeKey<S>;
    makeTargetCollectionItemFromSourceItem: IMakeDomainObject<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionKeys: () => CollectionUtils.Set.getKeys({ collection: domainPropCollection, makeKey: makeKeyFromDomainItem }),
      makeKeyFromSourceElement: makeKeyFromSourceElement,
      getItemFromTargetCollection: (key) => CollectionUtils.Set.getItem({ collection: domainPropCollection, makeKey: makeKeyFromDomainItem, key }),
      insertItemToTargetCollection: (key, value) => CollectionUtils.Set.insertItem({ collection: domainPropCollection, key, value }),
      deleteItemFromTargetCollection: (key) => CollectionUtils.Set.deleteItem({ collection: domainPropCollection, makeKey: makeKeyFromDomainItem, key }),
      makeTargetCollectionItemFromSourceItem: makeTargetCollectionItemFromSourceItem,
      trySyncElement: ({ sourceElementKey, sourceElementVal, targetElementKey, targetElementVal }) =>
        this.trySynchronizeNode({
          sourceNodeType: 'arrayElement',
          sourceNodeKey: sourceElementKey,
          sourceNodeVal: sourceElementVal,
          domainNodeKey: targetElementKey,
          domainNodeVal: targetElementVal,
          updateDomainNode: (key, value) => CollectionUtils.Set.updateItem({ collection: domainPropCollection, makeKey: makeKeyFromDomainItem, value }),
        }),
    });
  }

  private synchronizeDomainArray<S>({
    sourceCollection,
    domainPropCollection,
    makeKeyFromSourceElement,
    makeKeyFromDomainItem,
    makeTargetCollectionItemFromSourceItem,
  }: {
    sourceCollection: Array<S>;
    domainPropCollection: Array<any>;
    makeKeyFromSourceElement: IMakeKey<S>;
    makeKeyFromDomainItem: IMakeKey<S>;
    makeTargetCollectionItemFromSourceItem: IMakeDomainObject<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionKeys: () => CollectionUtils.Array.getKeys({ collection: domainPropCollection, makeKey: makeKeyFromDomainItem }),
      makeKeyFromSourceElement,
      getItemFromTargetCollection: (key) => CollectionUtils.Array.getItem({ collection: domainPropCollection, makeKey: makeKeyFromDomainItem, key }),
      insertItemToTargetCollection: (key, value) => CollectionUtils.Array.insertItem({ collection: domainPropCollection, key, value }),
      deleteItemFromTargetCollection: (key) => CollectionUtils.Array.deleteItem({ collection: domainPropCollection, makeKey: makeKeyFromDomainItem, key }),
      makeTargetCollectionItemFromSourceItem: makeTargetCollectionItemFromSourceItem,
      trySyncElement: ({ sourceElementKey, sourceElementVal, targetElementKey, targetElementVal }) =>
        this.trySynchronizeNode({
          sourceNodeType: 'arrayElement',
          sourceNodeKey: sourceElementKey,
          sourceNodeVal: sourceElementVal,
          domainNodeKey: targetElementKey,
          domainNodeVal: targetElementVal,
          updateDomainNode: (key, value) => CollectionUtils.Array.insertItem({ collection: domainPropCollection, key, value }),
        }),
    });
  }

  // ------------------------------------------------------------------------------------------------------------------
  // PUBLIC METHODS
  // ------------------------------------------------------------------------------------------------------------------

  /** */
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
