import { runInAction } from 'mobx';
import { comparers, IGraphSynchronizer, IGraphSyncOptions, IPropertySyncOptions, Logger, SyncUtils, IEqualityComparer, IsICustomEqualityDomainObject } from '.';
import { IsICustomSyncDomainObject, JavaScriptDefaultTypes } from './types';

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
  private defaultEqualityComparer: IEqualityComparer;
  private appendPrefixToObservableProperties: string | undefined;
  private pathMap: Map<string, IPropertySyncOptions<any, any>>;
  private typeMap: Map<string, IPropertySyncOptions<any, any>>;
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

  private getSourceObjectPath() {
    return this._sourceObjectKeyChain.join('.');
  }

  // ------------------------------------------------------------------------------------------------------------------
  // CONSTRUCTOR
  // ------------------------------------------------------------------------------------------------------------------
  constructor(options?: IGraphSyncOptions) {
    this.defaultEqualityComparer = options?.defaultEqualityChecker || comparers.apollo;
    this.appendPrefixToObservableProperties = options?.appendPrefixToObservableProperties;
    this.pathMap = options?.pathMap || new Map<string, IPropertySyncOptions<any, any>>();
    this.typeMap = options?.typeMap || new Map<string, IPropertySyncOptions<any, any>>();
  }

  // ------------------------------------------------------------------------------------------------------------------
  // PRIVATE METHODS
  // ------------------------------------------------------------------------------------------------------------------

  /** */
  private autoSynchronizeObjectState<S extends Record<string, any>, D extends Record<string, any>>({ key, sourceObject, domainObject }: { key: string; sourceObject: S; domainObject: D }) {
    // setup
    let firstLoop = true;

    //
    // Loop keys
    //
    for (const sourcePropKey of Object.keys(sourceObject)) {
      // Set Destination Prop Key, and if not found, fall back to name with prefix if supplied
      let domainPropKey = sourcePropKey;
      if (!(domainPropKey in domainObject) && this.appendPrefixToObservableProperties) {
        domainPropKey = `${sourcePropKey}${this.appendPrefixToObservableProperties}`;
      }

      // Manage loop state
      if (!firstLoop) this.popSourceObjectKeyOffStack();
      firstLoop = false;
      this.pushSourceObjectKeyOnStack(domainPropKey);

      // Check to see if key exists
      if (!(domainPropKey in domainObject)) {
        logger.trace(`domainPropKey ${domainPropKey} not found in syncable object. Skipping property`);
        continue;
      }

      this.trySynchronizeProperty({ sourceParentObject: sourceObject, sourcePropKey, domainParentObject: domainObject, domainPropKey });

      this.popSourceObjectKeyOffStack();
    }
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
    // get values needed for merging
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
          return true;
        }
        break;
      }
      case '[object Object]': {
        if (domainPropType !== '[object Object]')
          throw Error(`Object source types can only be transformed to Object destination types, and must not be null. Source type: '${sourcePropType}', Domain type: ${domainPropType} `);
        return this.trySynchronizeObjectState({ key: domainPropKey, sourceObject: sourcePropVal, domainObject: domainPropVal });
      }
      case '[object Array]': {
        if (domainPropType === '[object Undefined]') throw Error(`Destination types must not be null when transforming Array source type. Source type: '${sourcePropType}', Domain type: ${domainPropType} `);
        if (domainPropType === '[object Map]') {
          const domainPropMap: Map<string, any> = domainPropVal;
          this.synchronizeMap(sourcePropVal, domainPropMap);
        }
        if (domainPropType === '[object Set]') {
          // TODO
        }
        if (domainPropType === '[object Array]') {
          // TODO
        }
      }
    }

    logger.trace(`Skipping item ${sourcePropKey}. Unable to reconcile synchronization for types - source: (${sourcePropKey}, ${sourcePropType}), domain: (${domainPropKey}, ${domainPropType})`);
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
    const sourceObjectPath = this.getSourceObjectPath();
    const lastSourceObject = this._sourceObjectMap.get(key);

    // Check if already in sync
    const isInSync = IsICustomEqualityDomainObject(domainObject) ? domainObject.isStateEqual(sourceObject, lastSourceObject) : this.defaultEqualityComparer(sourceObject, lastSourceObject);
    if (isInSync) {
      logger.trace(`synchronizeObjectState - ${sourceObjectPath} - already in sync. Skipping`);
      return false;
    }

    // Synchronize
    if (IsICustomSyncDomainObject(domainObject)) {
      logger.trace(`synchronizeObjectState - ${sourceObjectPath} - custom state synchronizer found. Using to sync`);
      domainObject.synchronizeState({ sourceObject, graphSynchronizer: this });
    } else {
      logger.trace(`synchronizeObjectState - ${sourceObjectPath} - no custom state synchronizer found. Using autoSync`);
      this.autoSynchronizeObjectState({ key, sourceObject: sourceObject, domainObject: domainObject });
    }

    return true;
  }

  private synchronizeMap<S>(sourcePropVal: Iterable<S>, domainPropMap: Map<string, any>) {
    SyncUtils.synchronizeCollection({
      sourceCollection: sourcePropVal,
      getTargetCollectionKeys: () => Array.from(domainPropMap.keys()),
      makeItemKey: (sourceItem) => 'todo',
      getItem: (key) => domainPropMap.get(key),
      setItem: (key, value) => domainPropMap.set(key, value),
      deleteItem: (key) => domainPropMap.delete(key),
      makeItem: (key) => 'todo',
      trySyncProperty: ({ sourceItemKey, targetItemKey }) =>
        this.trySynchronizeProperty({ sourceParentObject: sourcePropVal, sourcePropKey: sourceItemKey, domainParentObject: domainPropMap, domainPropKey: targetItemKey }),
    });
  }

  private synchronizeSet<S>(sourcePropVal: Iterable<S>, domainPropMap: Set<string, any>) {
    SyncUtils.synchronizeCollection({
      sourceCollection: sourcePropVal,
      getTargetCollectionKeys: () => Array.from(domainPropMap.keys()),
      makeItemKey: (sourceItem) => 'todo',
      getItem: (key) => domainPropMap.get(key),
      setItem: (key, value) => domainPropMap.set(key, value),
      deleteItem: (key) => domainPropMap.delete(key),
      makeItem: (key) => 'todo',
      trySyncProperty: ({ sourceItemKey, targetItemKey }) =>
        this.trySynchronizeProperty({ sourceParentObject: sourcePropVal, sourcePropKey: sourceItemKey, domainParentObject: domainPropMap, domainPropKey: targetItemKey }),
    });
  }

  private synchronizeArray<S>(sourcePropVal: Iterable<S>, domainPropMap: Array<string>) {
    SyncUtils.synchronizeCollection({
      sourceCollection: sourcePropVal,
      getTargetCollectionKeys: () => Array.from(domainPropMap.keys()),
      makeItemKey: (sourceItem) => 'todo',
      getItem: (key) => domainPropMap.get(key),
      setItem: (key, value) => domainPropMap.set(key, value),
      deleteItem: (key) => domainPropMap.delete(key),
      makeItem: (key) => 'todo',
      trySyncProperty: ({ sourceItemKey, targetItemKey }) =>
        this.trySynchronizeProperty({ sourceParentObject: sourcePropVal, sourcePropKey: sourceItemKey, domainParentObject: domainPropMap, domainPropKey: targetItemKey }),
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
    runInAction('autoSynchronizeObjectState', () => {
      this.autoSynchronizeObjectState({ key: 'root', sourceObject: rootsourceObject, domainObject: rootDomainObject });
    });
    logger.trace('synchronize - action completed', { rootsourceObject, rootSyncableObject: rootDomainObject });
  }
}
