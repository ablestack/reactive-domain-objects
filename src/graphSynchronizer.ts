import { runInAction } from 'mobx';
import { comparers, IGraphSynchronizer, IGraphSyncOptions, IPropertySyncOptions, SyncUtils, IEqualityComparer, IsICustomEqualityDomainObject, CollectionUtils } from '.';
import { IsICustomSyncDomainObject, JavaScriptDefaultTypes, IsISyncableDomainObjectFactory, IMakeKey, IMakeDomainObject, IsISyncableCollection, ISyncableCollection } from './types';
import { Logger } from './logger';

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
  private _appendPrefixToObservableProperties: string | undefined;
  private _pathMap: Map<string, IPropertySyncOptions<any, any>>;
  private _typeMap: Map<string, IPropertySyncOptions<any, any>>;
  private _sourceObjectMap = new Map<string, any>();
  private _sourceObjectKeyChain = new Array<string>();

  // ------------------------------------------------------------------------------------------------------------------
  // PRIVATE PROPERTIES
  // ------------------------------------------------------------------------------------------------------------------
  private pushSourceObjectKeyOnStack(key: string) {
    this._sourceObjectKeyChain.push(key);
  }

  private popSourceObjectKeyOffStack() {
    this._sourceObjectKeyChain.pop();
  }

  private getSourceObjectPath(): string {
    return this._sourceObjectKeyChain.join('.');
  }

  private getPathMapSyncOptions(): IPropertySyncOptions<any, any> | undefined {
    const currentPath = this.getSourceObjectPath();
    return this._pathMap.get(currentPath);
  }

  private getTypeMapSyncOptions(): IPropertySyncOptions<any, any> | undefined {
    const currentPath = this.getSourceObjectPath();
    return this._typeMap.get(currentPath);
  }

  // ------------------------------------------------------------------------------------------------------------------
  // CONSTRUCTOR
  // ------------------------------------------------------------------------------------------------------------------
  constructor(options?: IGraphSyncOptions) {
    this._defaultEqualityComparer = options?.defaultEqualityChecker || comparers.apollo;
    this._appendPrefixToObservableProperties = options?.appendPrefixToObservableProperties;
    this._pathMap = options?.pathMap || new Map<string, IPropertySyncOptions<any, any>>();
    this._typeMap = options?.typeMap || new Map<string, IPropertySyncOptions<any, any>>();
  }

  // ------------------------------------------------------------------------------------------------------------------
  // PRIVATE METHODS
  // ------------------------------------------------------------------------------------------------------------------

  /** */
  private synchronizeObjectProperties<S extends Record<string, any>, D extends Record<string, any>>({ key, sourceObject, domainObject }: { key: string; sourceObject: S; domainObject: D }): boolean {
    let changed = false;

    // Loop properties
    for (const sourcePropKey of Object.keys(sourceObject)) {
      // Set Destination Prop Key, and if not found, fall back to name with prefix if supplied
      let domainPropKey = sourcePropKey;
      if (!(domainPropKey in domainObject) && this._appendPrefixToObservableProperties) {
        domainPropKey = `${sourcePropKey}${this._appendPrefixToObservableProperties}`;
      }

      // Check to see if key exists
      if (!(domainPropKey in domainObject)) {
        logger.trace(`domainPropKey ${domainPropKey} not found in syncable object. Skipping property`);
        continue;
      }

      changed ==
        this.trySynchronizeProperty({
          sourcePropVal: sourceObject[sourcePropKey],
          domainPropKey,
          getDomainProperty: (key) => CollectionUtils.Record.getItem({ collection: domainObject, key }),
          upsertDomainProperty: (key, value) => CollectionUtils.Record.upsertItem({ collection: domainObject, key, value }),
        }) || changed;
    }

    return changed;
  }

  /** */
  private trySynchronizeProperty({
    sourcePropVal,
    domainPropKey,
    getDomainProperty,
    upsertDomainProperty,
  }: {
    sourcePropVal: any;
    domainPropKey: string;
    getDomainProperty: (key: string) => any;
    upsertDomainProperty: (key: string, value: any) => void;
  }): boolean {
    this.pushSourceObjectKeyOnStack(domainPropKey);

    // setup
    let changed = false;
    const sourcePropType = toString.call(sourcePropVal) as JavaScriptDefaultTypes;

    const domainPropVal = getDomainProperty(domainPropKey);
    const domainPropType = toString.call(domainPropVal) as JavaScriptDefaultTypes;

    logger.trace(`synchronizeProperty - enter`, { sourcePropVal, sourcePropType, domainPropKey, domainPropVal, domainPropType });

    //
    switch (sourcePropType) {
      case '[object Boolean]':
      case '[object Date]':
      case '[object Number]':
      case '[object String]': {
        if (sourcePropType !== domainPropType && domainPropType !== '[object Undefined]')
          throw Error(`For primitive types, the source type and the domain type must match. Source type: '${sourcePropType}', Domain type: ${domainPropType}`);
        if (sourcePropVal !== domainPropVal) {
          logger.trace(`primitive value found in domainPropKey ${domainPropKey}. Setting from old value to new value`, domainPropVal, sourcePropVal);
          upsertDomainProperty(domainPropKey, sourcePropVal);
          changed = true;
        }
        break;
      }
      case '[object Object]': {
        if (domainPropType !== '[object Object]')
          throw Error(`[${domainPropKey}] Object source types can only be synchronized to Object destination types, and must not be null. Source type: '${sourcePropType}', Domain type: ${domainPropType} `);
        changed = this.trySynchronizeObjectState({ key: domainPropKey, sourceObject: sourcePropVal, domainObject: domainPropVal });
        break;
      }
      case '[object Array]': {
        changed = this.synchronizeSourceArray({ domainPropType, sourcePropType, domainPropVal, sourcePropVal });
        break;
      }
      default: {
        logger.trace(`Skipping item ${domainPropKey}. Unable to reconcile synchronization for types - sourcePropType: ${sourcePropType}), domainPropType: ${domainPropType}`);
        break;
      }
    }

    this.popSourceObjectKeyOffStack();
    return changed;
  }

  /** */
  private synchronizeSourceArray({ domainPropType, sourcePropType, domainPropVal, sourcePropVal }: { domainPropType: string; sourcePropType: string; domainPropVal: any; sourcePropVal: any }): boolean {
    if (domainPropType === '[object Undefined]') throw Error(`Destination types must not be null when transforming Array source type. Source type: '${sourcePropType}', Domain type: ${domainPropType} `);

    const pathMapOptions = this.getPathMapSyncOptions();
    const typeMapOptions = this.getPathMapSyncOptions();
    const typeOptions = IsISyncableDomainObjectFactory(domainPropVal) ? { makeKey: domainPropVal.makeKey, makeDomainObject: domainPropVal.makeDomainObject } : { makeKey: undefined, makeDomainObject: undefined };

    let makeKey: IMakeKey<any> | undefined = pathMapOptions?.syncFactory?.makeKey || typeMapOptions?.syncFactory?.makeKey || typeOptions.makeKey;
    let makeDomainObject: IMakeDomainObject<any, any> | undefined = pathMapOptions?.syncFactory?.makeDomainObject || typeMapOptions?.syncFactory?.makeDomainObject || typeOptions.makeDomainObject;

    if (!makeKey) {
      logger.trace(`synchronizeSourceArray - unable to synchronize, could not find 'makeKey' function in options or type. Path: ${this.getSourceObjectPath()}, type: ${domainPropType}`);
      return false;
    }

    if (!makeDomainObject) {
      logger.trace(`synchronizeSourceArray - unable to synchronize, could not find 'makeDomainObject' function in options or type. Path: ${this.getSourceObjectPath()}, type: ${domainPropType}`);
      return false;
    }

    //
    // Execute the sync based on type
    //
    if (IsISyncableCollection(domainPropVal)) {
      return this.synchronizeISyncableCollection({ sourcePropVal, domainPropCollection: domainPropVal as ISyncableCollection<any>, makeKey, makeDomainObject });
    } else if (domainPropType === '[object Map]') {
      return this.synchronizeDomainMap({ sourcePropVal, domainPropCollection: domainPropVal as Map<string, any>, makeKey, makeDomainObject });
    } else if (domainPropType === '[object Set]') {
      return this.synchronizeDomainSet({ sourcePropVal, domainPropCollection: domainPropVal as Set<any>, makeKey, makeDomainObject });
      return false;
    } else if (domainPropType === '[object Array]') {
      return this.synchronizeDomainArray({ sourcePropVal, domainPropCollection: domainPropVal as Array<any>, makeKey, makeDomainObject });
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
    const lastSourceObject = this._sourceObjectMap.get(key);

    // Check if already in sync
    const isInSync = IsICustomEqualityDomainObject(domainObject) ? domainObject.isStateEqual(sourceObject, lastSourceObject) : this._defaultEqualityComparer(sourceObject, lastSourceObject);
    if (!isInSync) {
      // Synchronize
      if (IsICustomSyncDomainObject(domainObject)) {
        logger.trace(`synchronizeObjectState - ${sourceObjectPath} - custom state synchronizer found. Using to sync`);
        changed = domainObject.synchronizeState({ sourceObject, graphSynchronizer: this });
      } else {
        logger.trace(`synchronizeObjectState - ${sourceObjectPath} - no custom state synchronizer found. Using autoSync`);
        changed = this.synchronizeObjectProperties({ key, sourceObject: sourceObject, domainObject: domainObject });
      }
    } else {
      logger.trace(`synchronizeObjectState - ${sourceObjectPath} - already in sync. Skipping`);
    }

    return changed;
  }

  private synchronizeISyncableCollection<S>({
    sourcePropVal,
    domainPropCollection,
    makeKey,
    makeDomainObject,
  }: {
    sourcePropVal: Iterable<S>;
    domainPropCollection: ISyncableCollection<any>;
    makeKey: IMakeKey<S>;
    makeDomainObject: IMakeDomainObject<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection: sourcePropVal,
      getTargetCollectionKeys: domainPropCollection.getKeys,
      makeItemKey: makeKey,
      getItem: (key) => domainPropCollection.getItem(key),
      upsertItem: (key, value) => domainPropCollection.upsertItem(key, value),
      deleteItem: (key) => domainPropCollection.deleteItem(key),
      makeItem: makeDomainObject,
      trySyncProperty: ({ sourceItemVal, targetItemKey }) =>
        this.trySynchronizeProperty({
          sourcePropVal: sourceItemVal,
          domainPropKey: targetItemKey,
          getDomainProperty: (key) => domainPropCollection.getItem(key),
          upsertDomainProperty: (key, value) => domainPropCollection.upsertItem(key, value),
        }),
    });
  }

  private synchronizeDomainMap<S>({
    sourcePropVal,
    domainPropCollection,
    makeKey,
    makeDomainObject,
  }: {
    sourcePropVal: Iterable<S>;
    domainPropCollection: Map<string, S>;
    makeKey: IMakeKey<S>;
    makeDomainObject: IMakeDomainObject<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection: sourcePropVal,
      getTargetCollectionKeys: () => Array.from(domainPropCollection.keys()),
      makeItemKey: makeKey,
      getItem: (key) => domainPropCollection.get(key),
      upsertItem: (key, value) => domainPropCollection.set(key, value),
      deleteItem: (key) => domainPropCollection.delete(key),
      makeItem: makeDomainObject,
      trySyncProperty: ({ sourceItemVal, targetItemKey }) =>
        this.trySynchronizeProperty({
          sourcePropVal: sourceItemVal,
          domainPropKey: targetItemKey,
          getDomainProperty: (key) => domainPropCollection.get(key),
          upsertDomainProperty: (key, value) => domainPropCollection.set(key, value),
        }),
    });
  }

  private synchronizeDomainSet<S>({
    sourcePropVal,
    domainPropCollection,
    makeKey,
    makeDomainObject,
  }: {
    sourcePropVal: Iterable<S>;
    domainPropCollection: Set<S>;
    makeKey: IMakeKey<S>;
    makeDomainObject: IMakeDomainObject<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection: sourcePropVal,
      getTargetCollectionKeys: () => CollectionUtils.Set.getKeys({ collection: domainPropCollection, makeKey }),
      makeItemKey: makeKey,
      getItem: (key) => CollectionUtils.Set.getItem({ collection: domainPropCollection, makeKey, key }),
      upsertItem: (key, value) => CollectionUtils.Set.upsertItem({ collection: domainPropCollection, makeKey, key, value }),
      deleteItem: (key) => CollectionUtils.Set.deleteItem({ collection: domainPropCollection, makeKey, key }),
      makeItem: makeDomainObject,
      trySyncProperty: ({ sourceItemVal, targetItemKey }) =>
        this.trySynchronizeProperty({
          sourcePropVal: sourceItemVal,
          domainPropKey: targetItemKey,
          getDomainProperty: (key) => CollectionUtils.Set.getItem({ collection: domainPropCollection, makeKey, key }),
          upsertDomainProperty: (key, value) => CollectionUtils.Set.upsertItem({ collection: domainPropCollection, makeKey, key, value }),
        }),
    });
  }

  private synchronizeDomainArray<S>({
    sourcePropVal,
    domainPropCollection,
    makeKey,
    makeDomainObject,
  }: {
    sourcePropVal: Iterable<S>;
    domainPropCollection: Array<any>;
    makeKey: IMakeKey<S>;
    makeDomainObject: IMakeDomainObject<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection: sourcePropVal,
      getTargetCollectionKeys: () => CollectionUtils.Array.getKeys({ collection: domainPropCollection, makeKey }),
      makeItemKey: makeKey,
      getItem: (key) => CollectionUtils.Array.getItem({ collection: domainPropCollection, makeKey, key }),
      upsertItem: (key, value) => CollectionUtils.Array.upsertItem({ collection: domainPropCollection, makeKey, key, value }),
      deleteItem: (key) => CollectionUtils.Array.deleteItem({ collection: domainPropCollection, makeKey, key }),
      makeItem: makeDomainObject,
      trySyncProperty: ({ sourceItemVal, targetItemKey }) =>
        this.trySynchronizeProperty({
          sourcePropVal: sourceItemVal,
          domainPropKey: targetItemKey,
          getDomainProperty: (key) => CollectionUtils.Array.getItem({ collection: domainPropCollection, makeKey, key }),
          upsertDomainProperty: (key, value) => CollectionUtils.Array.upsertItem({ collection: domainPropCollection, makeKey, key, value }),
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
    runInAction('synchronizeObjectProperties', () => {
      this.synchronizeObjectProperties({ key: 'root', sourceObject: rootsourceObject, domainObject: rootDomainObject });
    });
    logger.trace('synchronize - action completed', { rootsourceObject, rootSyncableObject: rootDomainObject });
  }
}
