import { runInAction } from 'mobx';
import { comparers, IGraphSynchronizer, IGraphSyncOptions, IPropertySyncOptions, SyncUtils, IEqualityComparer, IsICustomEqualityDomainObject } from '.';
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

      changed == this.trySynchronizeProperty({ sourceParentObject: sourceObject, sourcePropKey, domainParentObject: domainObject, domainPropKey }) || changed;
    }

    return changed;
  }

  /** */
  private trySynchronizeProperty({
    sourceParentObject,
    sourcePropKey,
    domainParentObject,
    domainPropKey,
  }: {
    sourceParentObject: object;
    sourcePropKey: string;
    domainParentObject: object;
    domainPropKey: string;
  }): boolean {
    this.pushSourceObjectKeyOnStack(domainPropKey);

    // setup
    let changed = false;
    const sourcePropVal = sourceParentObject[sourcePropKey];
    const sourcePropType = toString.call(sourcePropVal) as JavaScriptDefaultTypes;

    const domainPropVal = domainParentObject[domainPropKey];
    const domainPropType = toString.call(domainPropVal) as JavaScriptDefaultTypes;

    logger.trace(`synchronizeProperty - enter`, { sourceObject: sourceParentObject, sourcePropKey, sourcePropVal, sourcePropType, domainObject: domainParentObject, domainPropKey, domainPropVal, domainPropType });

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
          domainParentObject[domainPropKey] = sourcePropVal;
          changed = true;
        }
        break;
      }
      case '[object Object]': {
        if (domainPropType !== '[object Object]')
          throw Error(`Object source types can only be transformed to Object destination types, and must not be null. Source type: '${sourcePropType}', Domain type: ${domainPropType} `);
        changed = this.trySynchronizeObjectState({ key: domainPropKey, sourceObject: sourcePropVal, domainObject: domainPropVal });
      }
      case '[object Array]': {
        changed = this.synchronizeSourceArray({ domainPropType, sourcePropType, domainPropVal, sourcePropVal });
      }
      default: {
        logger.trace(`Skipping item ${sourcePropKey}. Unable to reconcile synchronization for types - source: (${sourcePropKey}, ${sourcePropType}), domain: (${domainPropKey}, ${domainPropType})`);
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
      return this.synchronizeDomainMap({ sourcePropVal, domainPropMap: domainPropVal as Map<string, any>, makeKey, makeDomainObject });
    } else if (domainPropType === '[object Set]') {
      return this.synchronizeDomainSet({ sourcePropVal, domainPropSet: domainPropVal as Set<any>, makeKey, makeDomainObject });
      return false;
    } else if (domainPropType === '[object Array]') {
      return this.synchronizeDomainArray({ sourcePropVal, domainPropArray: domainPropVal as Array<any>, makeKey, makeDomainObject });
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
      getItem: (key) => domainPropCollection.getItem,
      setItem: (key, value) => domainPropCollection.setItem,
      deleteItem: (key) => domainPropCollection.deleteItem,
      makeItem: makeDomainObject,
      trySyncProperty: ({ sourceItemKey, targetItemKey }) =>
        this.trySynchronizeProperty({ sourceParentObject: sourcePropVal, sourcePropKey: sourceItemKey, domainParentObject: domainPropCollection, domainPropKey: targetItemKey }),
    });
  }

  private synchronizeDomainMap<S>({
    sourcePropVal,
    domainPropMap,
    makeKey,
    makeDomainObject,
  }: {
    sourcePropVal: Iterable<S>;
    domainPropMap: Map<string, S>;
    makeKey: IMakeKey<S>;
    makeDomainObject: IMakeDomainObject<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection: sourcePropVal,
      getTargetCollectionKeys: () => Array.from(domainPropMap.keys()),
      makeItemKey: makeKey,
      getItem: (key) => domainPropMap.get(key),
      setItem: (key, value) => domainPropMap.set(key, value),
      deleteItem: (key) => domainPropMap.delete(key),
      makeItem: makeDomainObject,
      trySyncProperty: ({ sourceItemKey, targetItemKey }) =>
        this.trySynchronizeProperty({ sourceParentObject: sourcePropVal, sourcePropKey: sourceItemKey, domainParentObject: domainPropMap, domainPropKey: targetItemKey }),
    });
  }

  private synchronizeDomainSet<S>({
    sourcePropVal,
    domainPropSet,
    makeKey,
    makeDomainObject,
  }: {
    sourcePropVal: Iterable<S>;
    domainPropSet: Set<S>;
    makeKey: IMakeKey<S>;
    makeDomainObject: IMakeDomainObject<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection: sourcePropVal,
      getTargetCollectionKeys: () => Array.from(domainPropSet.values()).map((domainSetItem) => makeKey(domainSetItem)),
      makeItemKey: makeKey,
      getItem: (key) => Array.from(domainPropSet.values()).find((domainSetItem) => makeKey(domainSetItem) === key),
      setItem: (key, value) => domainPropSet.add(value),
      deleteItem: (key) => domainPropSet.delete(Array.from(domainPropSet.values()).find((domainSetItem) => makeKey(domainSetItem) === key)),
      makeItem: makeDomainObject,
      trySyncProperty: ({ sourceItemKey, targetItemKey }) =>
        this.trySynchronizeProperty({ sourceParentObject: sourcePropVal, sourcePropKey: sourceItemKey, domainParentObject: domainPropSet, domainPropKey: targetItemKey }),
    });
  }

  private synchronizeDomainArray<S>({
    sourcePropVal,
    domainPropArray,
    makeKey,
    makeDomainObject,
  }: {
    sourcePropVal: Iterable<S>;
    domainPropArray: Array<any>;
    makeKey: IMakeKey<S>;
    makeDomainObject: IMakeDomainObject<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection: sourcePropVal,
      getTargetCollectionKeys: () => domainPropArray.map((domainSetItem) => makeKey(domainSetItem)),
      makeItemKey: makeKey,
      getItem: (key) => domainPropArray.find((domainSetItem) => makeKey(domainSetItem) === key),
      setItem: (key, value) => domainPropArray.push(value),
      deleteItem: (key) =>
        domainPropArray.splice(
          domainPropArray.find((domainSetItem) => makeKey(domainSetItem) === key),
          1,
        ),
      makeItem: makeDomainObject,
      trySyncProperty: ({ sourceItemKey, targetItemKey }) =>
        this.trySynchronizeProperty({ sourceParentObject: sourcePropVal, sourcePropKey: sourceItemKey, domainParentObject: domainPropArray, domainPropKey: targetItemKey }),
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
