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
import { IsIHasCustomRdoFieldNames, InternalNodeKind, SourceNodeTypeInfo, JavaScriptBuiltInType, RdoNodeTypeInfo, IRdoInternalNodeWrapper, ISourceInternalNodeWrapper, isIRdoInternalNodeWrapper, isISourceInternalNodeWrapper } from './types';
import { NodeTypeUtils } from './utilities/node-type.utils';
import { RdoNodeWrapperFactory } from './rdo-node-wrappers/rdo-node-wrapper-factory';
import { SourceNodeWrapperFactory } from './source-internal-node-wrappers/source-node-wrapper-factory';

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
  private pushSourceNodeInstancePathOntoStack(key: string, sourceNodeKind: InternalNodeKind) {
    logger.trace(`Adding SourceNode to sourceNodeInstancePathStack: ${this.getSourceNodeInstancePath()} + ${key} (${sourceNodeKind})`);
    this._sourceNodeInstancePathStack.push(key);
    // reset locally cached dependencies
    this._sourceNodeInstancePath = undefined;

    // push to typepath if objectProperty
    if (sourceNodeKind === 'Object') {
      this._sourceNodePathStack.push(key);
      // reset locally cached dependencies
      this._sourceNodePath = undefined;
    }
  }

  private popSourceNodeInstancePathFromStack(sourceNodeKind: InternalNodeKind) {
    const key = this._sourceNodeInstancePathStack.pop();
    logger.trace(`Popping ${key} off sourceNodeInstancePathStack: ${this.getSourceNodeInstancePath()} (${sourceNodeKind})`);
    // reset locally cached dependencies
    this._sourceNodeInstancePath = undefined;

    // pop from typepath if objectProperty
    if (sourceNodeKind === 'Object') {
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

  // ------------------------------------------------------------------------------------------------------------------
  // PRIVATE METHODS
  // ------------------------------------------------------------------------------------------------------------------

 /**
   *
   */
  private trySynchronizeObject({ sourceNodePath, wrappedSourceNode, wrappedRdoNode }: { sourceNodePath, wrappedSourceNode: ISourceInternalNodeWrapper<any>, wrappedRdoNode:IRdoInternalNodeWrapper<any> }): boolean {
    let changed = false;

    // Loop properties
    for (const sourceFieldname of wrappedSourceNode.keys()) {
      const sourceFieldVal = wrappedSourceNode.getItem(sourceFieldname) ;
      const rdoFieldname = this.getRdoFieldname({ sourceNodePath, sourceFieldname, sourceFieldVal, parentObject: rdo });

      // Check to see if key exists
      if (!rdoFieldname) {
        logger.trace(`domainFieldname '${rdoFieldname}' not found in RDO. Skipping property`);
        continue;
      }

      changed = this.stepIntoChildNodeAndSync({
        sourceNodeKind: 'objectProperty',
        sourceNodeKey: sourceFieldname,
        sourceNodeVal: sourceObject[sourceFieldname],
        targetNodeKey: rdoFieldname,
        targetNodeVal: rdo[rdoFieldname],
        tryUpdateTargetNode: (key, value) => CollectionUtils.Record.tryUpdateItem({ record: rdo, key, value }),
      });
    }

    return changed;
  }

/**
   *
   */
  private stepIntoChildNodeAndSync({
    parentRdoNode,
    rdoNodeKey,
    parentSourceNode,
    sourceNodeKey,
  }: {
    parentRdoNode: IRdoInternalNodeWrapper<any>;
    rdoNodeKey: string;
    parentSourceNode: ISourceInternalNodeWrapper<any>;
    sourceNodeKey: string;
  }): boolean {
    logger.trace(`stepIntoChildNodeAndSync (${rdoNodeKey}) - enter`);
    let changed = false;

    // Node traversal tracking - step-in
    this.pushSourceNodeInstancePathOntoStack(sourceNodeKey, parentSourceNode.typeInfo.kind as InternalNodeKind);

    // Test to see if node should be ignored
    const matchingOptions = this.getMatchingOptionsForNode();
    
    if (matchingOptions?.ignore) {
      logger.trace(`stepIntoChildNodeAndSync (${rdoNodeKey}) - ignore node`);
      return false;
    } else {
      changed = this.synchChildNode({parentRdoNode, rdoNodeKey, parentSourceNode, sourceNodeKey});
    }

    // Node traversal tracking - step-out
    this.setLastSourceNodeInstancePathValue(parentSourceNode.node);
    this.popSourceNodeInstancePathFromStack(parentSourceNode.typeInfo.kind as InternalNodeKind);

    return changed;
  }

  /** */
  private synchChildNode({
    parentRdoNode,
    rdoNodeKey,
    parentSourceNode,
    sourceNodeKey,
  }: {
    parentRdoNode: IRdoInternalNodeWrapper<any>;
    rdoNodeKey: string;
    parentSourceNode: ISourceInternalNodeWrapper<any>;
    sourceNodeKey: string;
  }) {
    let changed = false;
    
    const rdoNode = parentRdoNode.getItem(rdoNodeKey);
    if(!rdoNode === undefined){
      //TODO LOG
      return false;
    }

    const sourceNode = parentSourceNode.getItem(sourceNodeKey);
    if(!sourceNode === undefined){
      //TODO LOG
      return false;
    }

    const wrappedRdoNode = RdoNodeWrapperFactory.make({ node: rdoNode, makeKey });
    const wrappedSourceNode = SourceNodeWrapperFactory.make(sourceNode, makeKey);
    
    switch (wrappedRdoNode.typeInfo.kind) {
      case 'Primitive': {
        if (wrappedSourceNode.typeInfo.builtInType !== wrappedRdoNode.typeInfo.builtInType) {
          throw Error(`For primitive types, the source type and the domain type must match. Source type: '${wrappedSourceNode.typeInfo.builtInType}', rdoNodeTypeInfo: ${wrappedRdoNode.typeInfo.builtInType}`);
        }
        if (wrappedSourceNode.node !== wrappedRdoNode.node) {
          logger.trace(`primitive value found in domainPropKey ${rdoNodeKey}. Setting from old value to new value`, wrappedRdoNode.node, wrappedSourceNode.node);
          changed = parentRdoNode.updateItem(wrappedSourceNode.node)          
        }
        break;
      }
      case 'Object': {
        if (wrappedRdoNode.typeInfo.kind !== 'Object') {
          throw Error(
            `[${this.getSourceNodeInstancePath()}] Object source types can only be synchronized to Object destination types, and must not be null. Source type: '${wrappedSourceNode.typeInfo.builtInType}', rdoNodeTypeInfo: ${wrappedRdoNode.typeInfo.builtInType} `,
          );
        }
        if (!isIRdoInternalNodeWrapper(wrappedRdoNode)) {
          throw Error(            `[${this.getSourceNodeInstancePath()}] Rdo Node should be of type RdoInternalNodeWrapper.`         );
        }
        if (!isISourceInternalNodeWrapper(wrappedSourceNode)) {
          throw Error(            `[${this.getSourceNodeInstancePath()}] Rdo Node should be of type RdoInternalNodeWrapper.`         );
        }
        
        changed = this.trySynchronizeRdo({ sourceNode, rdoNode });
        break;
      }
      case 'Array': {
        changed = this.synchronizeTargetCollectionWithSourceArray({ rdoNodeTypeInfo, sourceNodeTypeInfo: sourceNodeTypeInfo, targetCollection: targetNodeVal, sourceCollection: sourceNodeVal });
        break;
      }
      default: {
        logger.trace(`Skipping item ${this.getSourceNodeInstancePath()}. Unable to reconcile synchronization for types - sourceNodeTypeInfo: ${sourceNodeTypeInfo}), rdoNodeTypeInfo: ${rdoNodeTypeInfo}`);
        break;
      }
    }
    return changed;
  }

  /**
   *
   */
  private synchronizeTargetCollectionWithSourceArray({
    rdoNodeTypeInfo,
    sourceNodeTypeInfo,
    targetCollection,
    sourceCollection,
  }: {
    rdoNodeTypeInfo: RdoNodeTypeInfo;
    sourceNodeTypeInfo: SourceNodeTypeInfo;
    targetCollection: any;
    sourceCollection: Array<any>;
  }): boolean {
    if (!rdoNodeTypeInfo.type) throw Error(`Destination types must not be null when transforming Array source type. Source type: '${sourceNodeTypeInfo}', rdoNodeTypeInfo: ${rdoNodeTypeInfo} `);

    const { makeRdoCollectionKey, makeRdo } = this.tryGetRdoCollectionProcessingMethods({ sourceCollection, targetCollection: targetCollection });

    // VALIDATE
    if (sourceCollection.length > 0 && !makeRdoCollectionKey?.fromSourceElement) {
      throw new Error(
        `Could not find 'makeRdoCollectionKey?.fromSourceElement)' (Path: '${this.getSourceNodePath()}', type: ${rdoNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IRdoFactory on the contained type`,
      );
    }
    if (sourceCollection.length > 0 && !makeRdo) {
      throw new Error(`Could not find 'makeRdo' (Path: '${this.getSourceNodePath()}', type: ${rdoNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IRdoFactory on the contained type`);
    }

    //
    // Execute the sync based on collection type
    //

    //-----------------------------------------------------
    // ISYNCABLECOLLECTION SYNC
    //-----------------------------------------------------
    if (rdoNodeTypeInfo.type === 'ISyncableCollection') {
      const rdoCollection = targetCollection as ISyncableCollection<any>;

      if (sourceCollection.length === 0 && rdoCollection.size > 0) {
        rdoCollection.clear();
      }

      return this.synchronizeISyncableCollection({ sourceCollection, rdoCollection, makeRdoCollectionKey: makeRdoCollectionKey!, makeRdo: makeRdo! });

      //-----------------------------------------------------
      // MAP SYNC
      //-----------------------------------------------------
    } else if (rdoNodeTypeInfo.type === 'Map') {
      const rdoCollection = targetCollection as Map<string, any>;

      if (sourceCollection.length === 0 && rdoCollection.size > 0) {
        rdoCollection.clear();
      }

      return this.synchronizeTargetMap({ sourceCollection, rdoCollection, makeRdoCollectionKey: makeRdoCollectionKey!, makeRdo: makeRdo! });

      //-----------------------------------------------------
      // SET SYNC
      //-----------------------------------------------------
    } else if (rdoNodeTypeInfo.type === 'Set') {
      const rdoCollection = targetCollection as Set<any>;

      if (sourceCollection.length === 0 && rdoCollection.size > 0) {
        rdoCollection.clear();
      }

      if (rdoCollection.size > 0 && !makeRdoCollectionKey?.fromRdoElement)
        throw new Error(
          `Could not find '!makeRdoCollectionKey?.fromRdoElement' (Path: '${this.getSourceNodePath()}', type: ${rdoNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IRdoFactory on the contained type`,
        );
      if (sourceCollection.length > NON_MAP_COLLECTION_SIZE_WARNING_THREASHOLD)
        logger.warn(
          `Path: '${this.getSourceNodePath()}', collectionSize:${
            sourceCollection.lastIndexOf
          }, Target collection type: Set - It is recommended that the Map or Custom collections types are used in the RDOs for large collections. Set and Array collections will perform poorly with large collections`,
        );

      return this.synchronizeTargetSet({
        sourceCollection,
        rdoCollection,
        makeRdoCollectionKey: makeRdoCollectionKey!,
        makeRdo: makeRdo!,
      });

      //-----------------------------------------------------
      // ARRAY SYNC
      //-----------------------------------------------------
    } else if (rdoNodeTypeInfo.type === 'Array') {
      const rdoCollection = targetCollection as Array<any>;

      if (sourceCollection.length === 0 && rdoCollection.length > 0) {
        CollectionUtils.Array.clear({ collection: rdoCollection });
      }

      if (rdoCollection.length > 0 && !makeRdoCollectionKey?.fromRdoElement)
        throw new Error(
          `Could not find 'makeRdoCollectionKeyFromRdoElement' (Path: '${this.getSourceNodePath()}', type: ${rdoNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IRdoFactory on the contained type`,
        );
      if (sourceCollection.length > 100)
        logger.warn(
          `Path: '${this.getSourceNodePath()}', collectionSize:${
            sourceCollection.lastIndexOf
          }, Target collection type: Array - It is recommended that the Map or Custom collections types are used in RDOs for large collections. Set and Array collections will perform poorly with large collections`,
        );

      return this.synchronizeTargetArray({
        sourceCollection,
        rdoCollection,
        makeRdoCollectionKey: makeRdoCollectionKey!,
        makeRdo: makeRdo!,
      });
    }

    return false;
  }

  /** */
  private tryGetRdoCollectionProcessingMethods({ sourceCollection, targetCollection }: { sourceCollection: Array<any>; targetCollection: any }) {
    let makeRdoCollectionKey: IRdoCollectionKeyFactory<any, any> | undefined;
    let makeRdo: IMakeRDO<any, any> | undefined;

    const collectionElementType = this.getCollectionElementType({ sourceCollection, targetCollection });

    //
    // If types are primitive, provide auto methods, else try and get from configuration
    //
    if (collectionElementType === 'primitive' || collectionElementType === 'empty') {
      makeRdoCollectionKey = { fromSourceElement: (primitive) => primitive.toString(), fromRdoElement: (primitive) => primitive.toString() };
      makeRdo = (primitive) => primitive;
    } else {
      const targetDerivedOptions = this.getMatchingOptionsForCollectionNode({ sourceCollection, targetCollection });
      const typeDerivedOptions: Partial<INodeSyncOptions<any, any>> | undefined = IsISyncableRDOCollection(targetCollection)
        ? {
            makeRdoCollectionKey: {
              fromSourceElement: targetCollection.makeRdoCollectionKeyFromSourceElement,
              fromRdoElement: targetCollection.makeRdoCollectionKeyFromRdoElement,
            },
            makeRdo: targetCollection.makeRdo,
          }
        : undefined;

      // GET CONFIG ITEM: makeRdoCollectionKeyFromSourceElement
      makeRdoCollectionKey = targetDerivedOptions?.makeRdoCollectionKey || typeDerivedOptions?.makeRdoCollectionKey || this.tryMakeAutoKeyMaker({ sourceCollection, targetCollection });

      // GET CONFIG ITEM: makeRdo
      makeRdo = targetDerivedOptions?.makeRdo || typeDerivedOptions?.makeRdo;
    }

    return { makeRdoCollectionKey, makeRdo };
  }

  /** */
  private getMatchingOptionsForNode(): INodeSyncOptions<any, any> | undefined {
    const currentPath = this.getSourceNodePath();
    return this._targetedOptionNodePathsMap.get(currentPath);
  }

  /** */
  private getMatchingOptionsForCollectionNode({ sourceCollection, targetCollection }: { sourceCollection: Array<any>; targetCollection: Iterable<any> }): INodeSyncOptions<any, any> | undefined {
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

    // Try and get options from Target collection
    // ASSUMPTION - all supported collection types implement Iterable<>
    const firstItemInTargetCollection = targetCollection[Symbol.iterator]().next().value;
    options = this._targetedOptionMatchersArray.find((targetOptionsItem) => (targetOptionsItem.sourceNodeMatcher.nodeContent ? targetOptionsItem.sourceNodeMatcher.nodeContent(firstItemInTargetCollection) : false));
    return options;
  }

  /** */
  private tryMakeAutoKeyMaker({ sourceCollection, targetCollection }: { sourceCollection: Array<any>; targetCollection: Iterable<any> }): IRdoCollectionKeyFactory<any, any> | undefined {
    let makeRdoCollectionKey: IRdoCollectionKeyFactory<any, any> = {} as any;

    // Try and get options from source collection
    if (sourceCollection && sourceCollection.length > 0) {
      const firstItemInSourceCollection = sourceCollection[0];
      if (firstItemInSourceCollection && firstItemInSourceCollection.id) {
        makeRdoCollectionKey.fromSourceElement = (sourceNode: any) => {
          return sourceNode.id;
        };
      }
    }

    // Try and get options from domain collection
    const firstItemInTargetCollection = targetCollection[Symbol.iterator]().next().value;
    if (firstItemInTargetCollection) {
      let idKey = 'id';
      let hasIdKey = idKey in firstItemInTargetCollection;

      // If matching id key not found, try with standardPostfix if config setting supplied
      if (!hasIdKey && this._globalNodeOptions?.commonRdoFieldnamePostfix) {
        idKey = `${idKey}${this._globalNodeOptions.commonRdoFieldnamePostfix}`;
        hasIdKey = idKey in firstItemInTargetCollection;
      }

      if (hasIdKey) {
        makeRdoCollectionKey.fromRdoElement = (rdo: any) => {
          return rdo[idKey];
        };
      }
    }

    // Allow to return if fromRdoElement is null, even though this is not allowed in user supplied options
    //  When defaultKeyMaker, the code can handle a special case where fromRdoElement is null (when no items in domain collection)
    if (!makeRdoCollectionKey || !makeRdoCollectionKey.fromSourceElement) return undefined;
    else return makeRdoCollectionKey;
  }

  /** */
  private getCollectionElementType({ sourceCollection, targetCollection }: { sourceCollection: Array<any>; targetCollection: Iterable<any> }): 'empty' | 'primitive' | 'object' {
    // Try and get collection type from source collection
    if (sourceCollection && sourceCollection.length > 0) {
      const firstItemInSourceCollection = sourceCollection[0];
      const sourceNodeTypeInfo = NodeTypeUtils.getSourceNodeType(firstItemInSourceCollection);
      if (sourceNodeTypeInfo.kind === 'Primitive') return 'primitive';
      else return 'object';
    }

    // Try and get collection type from Target collection
    // ASSUMPTION - all supported collection types implement Iterable<>
    const firstItemInTargetCollection = targetCollection[Symbol.iterator]().next().value;
    if (!firstItemInTargetCollection) return 'empty';
    const rdoFieldTypeInfo = NodeTypeUtils.getRdoNodeType(firstItemInTargetCollection);
    if (rdoFieldTypeInfo.type === 'Primitive') return 'primitive';
    else return 'object';
  }

  /**
   *
   */
  private trySynchronizeRdo({ wrappedSourceNode, wrappedRdoNode }: { wrappedSourceNode: ISourceInternalNodeWrapper<any>, wrappedRdoNode:IRdoInternalNodeWrapper<any> }): boolean {
    let changed = false;
    const sourceNodePath = this.getSourceNodePath();
    const lastSourceObject = this.getLastSourceNodeInstancePathValue();
    const rdo = wrappedSourceNode.node;
    const sourceObject = wrappedSourceNode.node;

    // Check if previous source state and new source state are equal
    const isAlreadyInSync = IsICustomEqualityRDO(rdo) ? rdo.isStateEqual(sourceObject, lastSourceObject) : this._defaultEqualityComparer(sourceObject, lastSourceObject);

    // Call lifecycle methods if found
    if (IsIBeforeSyncIfNeeded(rdo)) rdo.beforeSyncIfNeeded({ sourceObject, isSyncNeeded: !isAlreadyInSync });

    // Call lifecycle methods if found
    if (IsIBeforeSyncUpdate(rdo)) rdo.beforeSyncUpdate({ sourceObject });

    if (!isAlreadyInSync) {
      // Call lifecycle methods if found
      if (IsIBeforeSyncUpdate(rdo)) rdo.beforeSyncUpdate({ sourceObject });

      // Synchronize
      if (IsICustomSync(rdo)) {
        logger.trace(`synchronizeObjectState - ${sourceNodePath} - custom state synchronizer found. Using to sync`);
        changed = rdo.synchronizeState({ sourceObject, continueSmartSync: this.makeContinueSmartSyncFunction({ originalSourceNodePath: sourceNodePath }) });
      } else {
        logger.trace(`synchronizeObjectState - ${sourceNodePath} - no custom state synchronizer found. Using autoSync`);
        changed = this.trySynchronizeObject({ sourceNodePath, wrappedSourceNode, wrappedRdoNode });
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

  /*
   *
   */
  private makeContinueSmartSyncFunction({
    originalSourceNodePath,
  }: {
    originalSourceNodePath: string;
  }): <S extends Record<string, any>, D extends Record<string, any>>({ sourceNodeSubPath, sourceObject, rdo }: { sourceNodeSubPath: string; sourceObject: S; rdo: D }) => boolean {
    return ({ sourceNodeSubPath: sourceNodeSubpath, sourceObject, rdo }) => {
      if (!sourceNodeSubpath) throw new Error('continueSync sourceNodeSubpath must not be null or empty. continueSync can only be called on child objects');

      const sourceNodePath = `${originalSourceNodePath}.${sourceNodeSubpath}`;
      return this.trySynchronizeObject({ sourceNodePath, sourceObject, rdo });
    };
  }

  /**
   *
   */
  private synchronizeISyncableCollection<S, D>({
    sourceCollection,
    rdoCollection,
    makeRdoCollectionKey,
    makeRdo,
  }: {
    sourceCollection: Array<S>;
    rdoCollection: ISyncableCollection<any>;
    makeRdoCollectionKey: IRdoCollectionKeyFactory<S, D>;
    makeRdo: IMakeRDO<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionSize: () => rdoCollection.size,
      getTargetCollectionKeys: rdoCollection.getKeys,
      makeRdoCollectionKeyFromSourceElement: makeRdoCollectionKey?.fromSourceElement!,
      tryGetItemFromTargetCollection: (key) => rdoCollection.get(key),
      insertItemToTargetCollection: (key, value) => rdoCollection.insertItemToTargetCollection(key, value),
      tryDeleteItemFromTargetCollection: (key) => rdoCollection.tryDeleteItemFromTargetCollection(key),
      makeItemForTargetCollection: makeRdo,
      tryStepIntoElementAndSync: ({ sourceElementKey, sourceElementVal, targetElementKey, targetElementVal }) =>
        this.tryStepIntoNodeAndSync({
          sourceNodeKind: 'arrayElement',
          sourceNodeKey: sourceElementKey,
          sourceNodeVal: sourceElementVal,
          targetNodeKey: targetElementKey,
          targetParentNode: sourceCollection,
          getTargetNodeValue: rdoCollection.get(),
        }),
    });
  }

  /**
   *
   */
  private synchronizeTargetMap<S, D>({
    sourceCollection,
    rdoCollection,
    makeRdoCollectionKey,
    makeRdo,
  }: {
    sourceCollection: Array<S>;
    rdoCollection: Map<string, S>;
    makeRdoCollectionKey: IRdoCollectionKeyFactory<S, D>;
    makeRdo: IMakeRDO<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionSize: () => rdoCollection.size,
      getTargetCollectionKeys: () => Array.from(rdoCollection.keys()),
      makeRdoCollectionKeyFromSourceElement: makeRdoCollectionKey?.fromSourceElement,
      tryGetItemFromTargetCollection: (key) => rdoCollection.get(key),
      insertItemToTargetCollection: (key, value) => rdoCollection.set(key, value),
      tryDeleteItemFromTargetCollection: (key) => rdoCollection.delete(key),
      makeItemForTargetCollection: makeRdo,
      tryStepIntoElementAndSync: ({ sourceElementKey, sourceElementVal, targetElementKey, targetElementVal }) =>
        this.tryStepIntoNodeAndSync({
          sourceNodeKind: 'arrayElement',
          sourceNodeKey: sourceElementKey,
          sourceNodeVal: sourceElementVal,
          targetNodeKey: targetElementKey,
          targetNodeVal: targetElementVal,
        }),
    });
  }

  /**
   *
   */
  private synchronizeTargetSet<S, D>({
    sourceCollection,
    rdoCollection,
    makeRdoCollectionKey,
    makeRdo,
  }: {
    sourceCollection: Array<S>;
    rdoCollection: Set<D>;
    makeRdoCollectionKey: IRdoCollectionKeyFactory<S, D>;
    makeRdo: IMakeRDO<S, D>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionSize: () => rdoCollection.size,
      getTargetCollectionKeys: makeRdoCollectionKey?.fromRdoElement ? () => CollectionUtils.Set.getKeys({ collection: rdoCollection, makeCollectionKey: makeRdoCollectionKey.fromRdoElement! }) : undefined,
      makeRdoCollectionKeyFromSourceElement: makeRdoCollectionKey?.fromSourceElement,
      tryGetItemFromTargetCollection: makeRdoCollectionKey?.fromRdoElement ? (key) => CollectionUtils.Set.getItem({ collection: rdoCollection, makeCollectionKey: makeRdoCollectionKey.fromRdoElement!, key }) : undefined,
      insertItemToTargetCollection: (key, value) => CollectionUtils.Set.insertItem({ collection: rdoCollection, key, value }),
      tryDeleteItemFromTargetCollection: makeRdoCollectionKey?.fromRdoElement
        ? (key) => CollectionUtils.Set.deleteItem({ collection: rdoCollection, makeCollectionKey: makeRdoCollectionKey.fromRdoElement!, key })
        : undefined,
      makeItemForTargetCollection: makeRdo,
      tryStepIntoElementAndSync: ({ sourceElementKey, sourceElementVal, targetElementKey, targetElementVal }) =>
        this.tryStepIntoNodeAndSync({
          sourceNodeKind: 'arrayElement',
          sourceNodeKey: sourceElementKey,
          sourceNodeVal: sourceElementVal,
          targetNodeKey: targetElementKey,
          targetNodeVal: targetElementVal,
        }),
    });
  }

  /**
   *
   */
  private synchronizeTargetArray<S, D>({
    sourceCollection,
    rdoCollection,
    makeRdoCollectionKey,
    makeRdo,
  }: {
    sourceCollection: Array<S>;
    rdoCollection: Array<any>;
    makeRdoCollectionKey: IRdoCollectionKeyFactory<S, D>;
    makeRdo: IMakeRDO<any, any>;
  }): boolean {
    return SyncUtils.synchronizeCollection({
      sourceCollection,
      getTargetCollectionSize: () => rdoCollection.length,
      getTargetCollectionKeys: makeRdoCollectionKey?.fromRdoElement ? () => CollectionUtils.Array.getKeys({ collection: rdoCollection, makeCollectionKey: makeRdoCollectionKey.fromRdoElement! }) : undefined,
      makeRdoCollectionKeyFromSourceElement: makeRdoCollectionKey?.fromSourceElement,
      makeItemForTargetCollection: makeRdo,
      tryGetItemFromTargetCollection: makeRdoCollectionKey?.fromRdoElement
        ? (key) => CollectionUtils.Array.getItem({ collection: rdoCollection, makeCollectionKey: makeRdoCollectionKey?.fromRdoElement!, key })
        : undefined,
      insertItemToTargetCollection: (key, value) => CollectionUtils.Array.insertItem({ collection: rdoCollection, key, value }),
      tryDeleteItemFromTargetCollection: makeRdoCollectionKey?.fromRdoElement
        ? (key) => CollectionUtils.Array.deleteItem({ collection: rdoCollection, makeCollectionKey: makeRdoCollectionKey.fromRdoElement!, key })
        : undefined,
      tryStepIntoElementAndSync: ({ sourceElementKey, sourceElementVal, targetElementKey, targetElementVal }) =>
        this.tryStepIntoNodeAndSync({
          sourceNodeKind: 'arrayElement',
          sourceNodeKey: sourceElementKey,
          sourceNodeVal: sourceElementVal,
          targetNodeKey: targetElementKey,
          targetNodeVal: targetElementVal,
        }),
    });
  }

 
  

  