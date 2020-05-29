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
  private pushSourceNodeKeyOnStack(key: string, sourceNodeType: JsonNodeType) {
    this._sourceNodeKeyChain.push(key);
    if (sourceNodeType === 'objectProperty') this._sourceObjectKeyChain.push(key);
  }

  private popSourceNodeKeyOffStack(sourceNodeType: JsonNodeType) {
    this._sourceNodeKeyChain.pop();
    if (sourceNodeType === 'objectProperty') this._sourceObjectKeyChain.pop();
  }

  // NodePath is used for persisting previous source state. It is unique per node, but dynamic (thus not predictable)
  private getSourceNodePath(): string {
    return this._sourceNodeKeyChain.join('.');
  }

  // ObjectPath is used for configuration generated options. It is the node path, with the collection keys skipped. It is static, but  not unique per node
  private getSourceObjectPath(): string {
    return this._sourceNodeKeyChain.join('.');
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
          getDomainNode: (key) => CollectionUtils.Record.getItem({ collection: domainObject, key }),
          upsertDomainNode: (key, value) => CollectionUtils.Record.upsertItem({ collection: domainObject, key, value }),
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
    getDomainNode,
    upsertDomainNode,
  }: {
    sourceNodeType: JsonNodeType;
    sourceNodeKey: string;
    sourceNodeVal: any;
    domainNodeKey: string;
    getDomainNode: (key: string) => any;
    upsertDomainNode: (key: string, value: any) => void;
  }): boolean {
    this.pushSourceNodeKeyOnStack(sourceNodeKey, sourceNodeType);

    // setup
    let changed = false;
    const sourcePropType = toString.call(sourceNodeVal) as JavaScriptBuiltInType;

    const domainPropVal = getDomainNode(domainNodeKey);
    const domainPropType = toString.call(domainPropVal) as JavaScriptBuiltInType;

    logger.trace(`synchronizeProperty (${domainNodeKey}) - enter`, { sourceNodeVal, domainPropVal });

    //
    switch (sourcePropType) {
      case '[object Boolean]':
      case '[object Date]':
      case '[object Number]':
      case '[object String]': {
        if (sourcePropType !== domainPropType && domainPropType !== '[object Undefined]')
          throw Error(`For primitive types, the source type and the domain type must match. Source type: '${sourcePropType}', Domain type: ${domainPropType}`);
        if (sourceNodeVal !== domainPropVal) {
          logger.trace(`primitive value found in domainPropKey ${domainNodeKey}. Setting from old value to new value`, domainPropVal, sourceNodeVal);
          upsertDomainNode(domainNodeKey, sourceNodeVal);
          changed = true;
        }
        break;
      }
      case '[object Object]': {
        if (domainPropType !== '[object Object]')
          throw Error(`[${domainNodeKey}] Object source types can only be synchronized to Object destination types, and must not be null. Source type: '${sourcePropType}', Domain type: ${domainPropType} `);
        changed = this.trySynchronizeObjectState({ key: domainNodeKey, sourceObject: sourceNodeVal, domainObject: domainPropVal });
        break;
      }
      case '[object Array]': {
        changed = this.synchronizeSourceArray({ sourceNodeKey, domainPropType, sourcePropType, domainPropVal, sourceCollection: sourceNodeVal });
        break;
      }
      default: {
        logger.trace(`Skipping item ${domainNodeKey}. Unable to reconcile synchronization for types - sourcePropType: ${sourcePropType}), domainPropType: ${domainPropType}`);
        break;
      }
    }

    this.popSourceNodeKeyOffStack(sourceNodeType);
    return changed;
  }

  /** */
  private synchronizeSourceArray({
    sourceNodeKey,
    domainPropType,
    sourcePropType,
    domainPropVal,
    sourceCollection,
  }: {
    sourceNodeKey: string;
    domainPropType: string;
    sourcePropType: string;
    domainPropVal: any;
    sourceCollection: any;
  }): boolean {
    if (domainPropType === '[object Undefined]') throw Error(`Destination types must not be null when transforming Array source type. Source type: '${sourcePropType}', Domain type: ${domainPropType} `);

    const sourcePathMapOptions = this.getPathMapSyncOptions();
    const sourceTypeMapOptions = this.getPathMapSyncOptions();
    const typeOptions = IsIDomainObjectFactory(domainPropVal) ? { makeKey: domainPropVal.makeKey, makeItem: domainPropVal.makeItem } : { makeKey: undefined, makeItem: undefined };

    let makeKey: IMakeKey<any> | undefined = sourcePathMapOptions?.domainObjectCreation?.makeKey || sourceTypeMapOptions?.domainObjectCreation?.makeKey || typeOptions.makeKey;
    let makeItem: IMakeDomainObject<any, any> | undefined = sourcePathMapOptions?.domainObjectCreation?.makeItem || sourceTypeMapOptions?.domainObjectCreation?.makeItem || typeOptions.makeItem;

    if (!makeKey) {
      logger.warn(`synchronizeSourceArray - unable to synchronize, could not find 'makeKey' function in options or type. Path: ${this.getSourceObjectPath()}, type: ${domainPropType}`);
      return false;
    }

    if (!makeItem) {
      logger.warn(`synchronizeSourceArray - unable to synchronize, could not find 'makeItem' function in options or type. Path: ${this.getSourceObjectPath()}, type: ${domainPropType}`);
      return false;
    }

    //
    // Execute the sync based on type
    //
    if (IsISyncableCollection(domainPropVal)) {
      return this.synchronizeISyncableCollection({ sourceNodeKey, sourceCollection, domainPropCollection: domainPropVal as ISyncableCollection<any>, makeKey, makeItem });
    } else if (domainPropType === '[object Map]') {
      return this.synchronizeDomainMap({ sourceNodeKey, sourceCollection, domainPropCollection: domainPropVal as Map<string, any>, makeKey, makeItem });
    } else if (domainPropType === '[object Set]') {
      return this.synchronizeDomainSet({ sourceNodeKey, sourceCollection, domainPropCollection: domainPropVal as Set<any>, makeKey, makeItem });
      return false;
    } else if (domainPropType === '[object Array]') {
      return this.synchronizeDomainArray({ sourceNodeKey, sourceCollection, domainPropCollection: domainPropVal as Array<any>, makeKey, makeItem });
      return false;
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
    sourceNodeKey,
    sourceCollection,
    domainPropCollection,
    makeKey,
    makeItem,
  }: {
    sourceNodeKey: string;
    sourceCollection: Iterable<S>;
    domainPropCollection: ISyncableCollection<any>;
    makeKey: IMakeKey<S>;
    makeItem: IMakeDomainObject<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionKeys: domainPropCollection.getKeys,
      makeKey: makeKey,
      getItem: (key) => domainPropCollection.getItem(key),
      upsertItem: (key, value) => domainPropCollection.upsertItem(key, value),
      deleteItem: (key) => domainPropCollection.deleteItem(key),
      makeItem: makeItem,
      trySyncElement: ({ sourceNodeVal, targetItemKey }) =>
        this.trySynchronizeNode({
          sourceNodeType: 'arrayElement',
          sourceNodeKey,
          sourceNodeVal,
          domainNodeKey: targetItemKey,
          getDomainNode: (key) => domainPropCollection.getItem(key),
          upsertDomainNode: (key, value) => domainPropCollection.upsertItem(key, value),
        }),
    });
  }

  private synchronizeDomainMap<S>({
    sourceNodeKey,
    sourceCollection,
    domainPropCollection,
    makeKey,
    makeItem,
  }: {
    sourceNodeKey: string;
    sourceCollection: Iterable<S>;
    domainPropCollection: Map<string, S>;
    makeKey: IMakeKey<S>;
    makeItem: IMakeDomainObject<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionKeys: () => Array.from(domainPropCollection.keys()),
      makeKey: makeKey,
      getItem: (key) => domainPropCollection.get(key),
      upsertItem: (key, value) => domainPropCollection.set(key, value),
      deleteItem: (key) => domainPropCollection.delete(key),
      makeItem: makeItem,
      trySyncElement: ({ sourceNodeVal: sourceCollection, targetItemKey }) =>
        this.trySynchronizeNode({
          sourceNodeType: 'arrayElement',
          sourceNodeKey,
          sourceNodeVal: sourceCollection,
          domainNodeKey: targetItemKey,
          getDomainNode: (key) => domainPropCollection.get(key),
          upsertDomainNode: (key, value) => domainPropCollection.set(key, value),
        }),
    });
  }

  private synchronizeDomainSet<S>({
    sourceNodeKey,
    sourceCollection,
    domainPropCollection,
    makeKey,
    makeItem,
  }: {
    sourceNodeKey: string;
    sourceCollection: Iterable<S>;
    domainPropCollection: Set<S>;
    makeKey: IMakeKey<S>;
    makeItem: IMakeDomainObject<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionKeys: () => CollectionUtils.Set.getKeys({ collection: domainPropCollection, makeKey }),
      makeKey: makeKey,
      getItem: (key) => CollectionUtils.Set.getItem({ collection: domainPropCollection, makeKey, key }),
      upsertItem: (key, value) => CollectionUtils.Set.upsertItem({ collection: domainPropCollection, makeKey, key, value }),
      deleteItem: (key) => CollectionUtils.Set.deleteItem({ collection: domainPropCollection, makeKey, key }),
      makeItem: makeItem,
      trySyncElement: ({ sourceNodeVal: sourceCollection, targetItemKey }) =>
        this.trySynchronizeNode({
          sourceNodeType: 'arrayElement',
          sourceNodeKey,
          sourceNodeVal: sourceCollection,
          domainNodeKey: targetItemKey,
          getDomainNode: (key) => CollectionUtils.Set.getItem({ collection: domainPropCollection, makeKey, key }),
          upsertDomainNode: (key, value) => CollectionUtils.Set.upsertItem({ collection: domainPropCollection, makeKey, key, value }),
        }),
    });
  }

  private synchronizeDomainArray<S>({
    sourceNodeKey,
    sourceCollection,
    domainPropCollection,
    makeKey,
    makeItem,
  }: {
    sourceNodeKey: string;
    sourceCollection: Iterable<S>;
    domainPropCollection: Array<any>;
    makeKey: IMakeKey<S>;
    makeItem: IMakeDomainObject<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionKeys: () => CollectionUtils.Array.getKeys({ collection: domainPropCollection, makeKey }),
      makeKey: makeKey,
      getItem: (key) => CollectionUtils.Array.getItem({ collection: domainPropCollection, makeKey, key }),
      upsertItem: (key, value) => CollectionUtils.Array.upsertItem({ collection: domainPropCollection, makeKey, key, value }),
      deleteItem: (key) => CollectionUtils.Array.deleteItem({ collection: domainPropCollection, makeKey, key }),
      makeItem: makeItem,
      trySyncElement: ({ sourceNodeVal: sourceCollection, targetItemKey }) =>
        this.trySynchronizeNode({
          sourceNodeType: 'arrayElement',
          sourceNodeKey,
          sourceNodeVal: sourceCollection,
          domainNodeKey: targetItemKey,
          getDomainNode: (key) => CollectionUtils.Array.getItem({ collection: domainPropCollection, makeKey, key }),
          upsertDomainNode: (key, value) => CollectionUtils.Array.upsertItem({ collection: domainPropCollection, makeKey, key, value }),
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
