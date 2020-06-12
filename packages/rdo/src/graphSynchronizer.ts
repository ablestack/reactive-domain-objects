import { comparers, IEqualityComparer, IGlobalPropertyNameTransformation, IGraphSynchronizer, IGraphSyncOptions, INodeSyncOptions } from '.';
import { Logger } from './infrastructure/logger';
import { RdoNodeWrapperFactory } from './rdo-node-wrappers/rdo-node-wrapper-factory';
import { SourceNodeWrapperFactory } from './source-internal-node-wrappers/source-node-wrapper-factory';
import { InternalNodeKind, IRdoCollectionNodeWrapper, IRdoInternalNodeWrapper, isIRdoInternalNodeWrapper, isISourceInternalNodeWrapper, ISourceInternalNodeWrapper, ISourceNodeWrapper } from './types';

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
  private stepIntoNodeAndSync({
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

    const wrappedSourceNode = SourceNodeWrapperFactory.make({ sourceNodePath:this.getSourceNodePath(), node: sourceNode, lastSourceNode:this.getLastSourceNodeInstancePathValue() });
    const wrappedRdoNode = RdoNodeWrapperFactory.make({ wrappedSourceNode, node: rdoNode });

      
      changed = wrappedRdoNode.smartSync();
    }

    // Node traversal tracking - step-out
    this.setLastSourceNodeInstancePathValue(parentSourceNode.node);
    this.popSourceNodeInstancePathFromStack(parentSourceNode.typeInfo.kind as InternalNodeKind);

    return changed;
  }

  /** */
  private synchInternalNode({
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

// TODO - move these into collection methods

  private synchronizeTargetCollectionWithSourceArray({    wrappedRdoCollectionNode,    wrappedSourceCollectionNode  }: {    wrappedRdoCollectionNode: IRdoCollectionNodeWrapper<any>,    wrappedSourceCollectionNode: ISourceNodeWrapper  }): boolean {
    if (wrappedRdoCollectionNode.typeInfo.builtInType !== '[object Undefined]') throw Error(`Destination types must not be null when transforming Array source type. Source type: '${wrappedSourceCollectionNode.typeInfo.builtInType}', rdoNodeTypeInfo: ${wrappedRdoCollectionNode.typeInfo.builtInType} `);

    const { makeRdoCollectionKey, makeRdo } = this.tryGetRdoCollectionProcessingMethods({ sourceCollection:wrappedRdoCollectionNode.node, targetCollection: wrappedRdoCollectionNode.node });

    // VALIDATE
    if (wrappedSourceCollectionNode.length > 0 && !makeRdoCollectionKey?.fromSourceElement) {
      throw new Error(
        `Could not find 'makeRdoCollectionKey?.fromSourceElement)' (Path: '${this.getSourceNodePath()}', type: ${rdoNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IRdoFactory on the contained type`,
      );
    }
    if (sourceCollection.length > 0 && !makeRdo) {
      throw new Error(`Could not find 'makeRdo' (Path: '${this.getSourceNodePath()}', type: ${rdoNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IRdoFactory on the contained type`);
    }


    // Execute
    return wrappedRdoCollectionNode.smartSync({ lastSourceObject: wrappedSourceCollectionNode.node})
  }

  

  /** */
  private getMatchingOptionsForNode(): INodeSyncOptions<any, any> | undefined {
    const currentPath = this.getSourceNodePath();
    return this._targetedOptionNodePathsMap.get(currentPath);
  }

  


  

 