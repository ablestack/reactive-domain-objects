import { IGlobalNodeOptions, INodeSyncOptions, IRdoCollectionNodeWrapper, IRdoNodeWrapper, ISourceNodeWrapper, ISyncChildNode, RdoNodeTypeInfo, config } from '../..';
import { Logger } from '../../infrastructure/logger';
import { RdoInternalNWBase } from './rdo-internal-nw-base';
import { NodeTypeUtils } from '../utils/node-type.utils';
import { isIMakeCollectionKeyFromRdoElement, isIMakeRdo, IRdoInternalNodeWrapper, isISourceCollectionNodeWrapper } from '../../types';
import { observable } from 'mobx';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { NodeChange } from '../../types/event-types';
import _ from 'lodash';

const logger = Logger.make('RdoCollectionNWBase');

export abstract class RdoCollectionNWBase<S, D> extends RdoInternalNWBase<S, D> implements IRdoCollectionNodeWrapper<S, D> {
  constructor({
    typeInfo,
    key,
    wrappedParentRdoNode,
    wrappedSourceNode,
    syncChildNode,
    matchingNodeOptions,
    globalNodeOptions,
    targetedOptionMatchersArray,
    eventEmitter,
  }: {
    typeInfo: RdoNodeTypeInfo;
    key: string | undefined;
    wrappedParentRdoNode: IRdoInternalNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S>;
    syncChildNode: ISyncChildNode<S, D>;
    matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
    globalNodeOptions: IGlobalNodeOptions | undefined;
    targetedOptionMatchersArray: Array<INodeSyncOptions<any, any>>;
    eventEmitter: EventEmitter<NodeChange>;
  }) {
    super({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
  }

  //------------------------------
  // Protected
  //------------------------------
  protected synchronizeCollection() {
    const rdo = this;
    const syncChildNode = this._syncChildNode;

    let changed = false;
    const sourceKeys = new Array<string>();
    const targetCollectionStartedEmpty = rdo.childElementCount() === 0;

    if (rdo.wrappedSourceNode.childElementCount() > 0) {
      if (!isISourceCollectionNodeWrapper(rdo.wrappedSourceNode)) throw new Error('Can only sync Rdo collection types with Rdo source types');
      const sourceCollection = rdo.wrappedSourceNode.elements();

      for (const sourceItem of sourceCollection) {
        if (sourceItem === null || sourceItem === undefined) continue;
        // Make key

        const key = rdo.wrappedSourceNode.makeCollectionKey(sourceItem);
        if (!key) throw Error(`rdo.wrappedSourceNode.makeKey produced null or undefined. It must be defined when sourceCollection.length > 0`);

        // Track keys so can be used in target item removal later
        sourceKeys.push(key);

        // Get or create target item
        let targetItem: D | null | undefined = undefined;
        if (!targetCollectionStartedEmpty) {
          logger.trace(`sourceNodePath: ${rdo.wrappedSourceNode.sourceNodePath} - Found item ${key} in rdoCollection`, targetItem);
          targetItem = rdo.getElement(key);
        }
        if (!targetItem) {
          if (!rdo.makeRdoElement) throw Error(`sourceNodePath: ${rdo.wrappedSourceNode.sourceNodePath} - rdo.makeItem wan null or undefined. It must be defined when targetItem collection not empty`);
          targetItem = rdo.makeRdoElement(sourceItem);
          if (!targetItem) {
            throw Error(`sourceNodePath: ${rdo.wrappedSourceNode.sourceNodePath} - rdo.makeRdoElement produced null or undefined`);
          }

          logger.trace(`sourceNodePath: ${rdo.wrappedSourceNode.sourceNodePath} - Adding item ${key} to collection`, targetItem);
          rdo.insertElement(key, targetItem);
          this.eventEmitter.publish('nodeChange', { changeType: 'create', sourceNodePath: rdo.wrappedSourceNode.sourceNodePath, sourceKey: key, rdoKey: key, rdoOldValue: undefined, rdoNewValue: targetItem });
        }

        //
        // Sync Item
        //
        logger.trace(`Syncing item ${key} in collection`, sourceItem);
        changed = syncChildNode({ wrappedParentRdoNode: rdo, rdoNodeItemValue: targetItem, rdoNodeItemKey: key, sourceNodeItemKey: key });
        continue;
      }
    }

    // short-cutting this check when initial collection was empty.
    // This id a performance optimization and also (indirectly)
    // allows for auto collection methods based on target item types
    if (!targetCollectionStartedEmpty) {
      if (!rdo.itemKeys) throw Error(`getTargetCollectionKeys wan null or undefined. It must be defined when targetCollection.length > 0`);
      if (!rdo.deleteElement) throw Error(`tryDeleteItemFromTargetCollection wan null or undefined. It must be defined when targetCollection.length > 0`);
      // If destination item missing from source - remove from destination
      const targetCollectionKeys = Array.from<string>(rdo.itemKeys());
      const targetCollectionKeysInDestinationOnly = _.difference(targetCollectionKeys, sourceKeys);
      if (targetCollectionKeysInDestinationOnly.length > 0) {
        targetCollectionKeysInDestinationOnly.forEach((key) => {
          const deletedItem = rdo.deleteElement(key);
          this.eventEmitter.publish('nodeChange', { changeType: 'delete', sourceNodePath: rdo.wrappedSourceNode.sourceNodePath, sourceKey: key, rdoKey: key, rdoOldValue: deletedItem, rdoNewValue: undefined });
        });
        changed = true;
      }
    }

    return changed;
  }

  //------------------------------
  // IRdoCollectionNodeWrapper
  //------------------------------
  // private _childElementSourceNodeKind: ChildElementsNodeKind | undefined = undefined;
  // public get childElementsNodeKind(): ChildElementsNodeKind {
  //   if (!this._childElementSourceNodeKind) {
  //     // Try and get element type from source collection
  //     const firstElement = this.elements()[Symbol.iterator]().next().value;
  //     if (firstElement) {
  //       this._childElementSourceNodeKind = NodeTypeUtils.getRdoNodeType(firstElement).kind;
  //     } else this._childElementSourceNodeKind = null;
  //   }
  //   return this._childElementSourceNodeKind;
  // }

  public makeCollectionKey = (item: D) => {
    // Use IMakeCollectionKey provided on options if available
    if (this.getNodeOptions()?.makeRdoCollectionKey?.fromRdoElement) {
      const key = this.getNodeOptions()!.makeRdoCollectionKey!.fromRdoElement(item);
      logger.trace(`makeCollectionKey - sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - making key from nodeOptions: ${key}`);
      return key;
    }

    if (isIMakeCollectionKeyFromRdoElement(this.value)) {
      const key = this.value.makeCollectionKeyFromRdoElement(item);
      logger.trace(`makeCollectionKey - sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - making key from IMakeCollectionKeyFromRdoElement: ${key}`);
      return key;
    }

    // If primitive, the item is the key
    if (NodeTypeUtils.isPrimitive(item)) {
      const key = String(item);
      logger.trace(`makeCollectionKey - sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - making key from Primitive value: ${key}`);
      return key;
    }

    // Look for idKey
    if (config.defaultIdKey in item) {
      const key = item[config.defaultIdKey];
      logger.trace(`makeCollectionKey - sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - making key from defaultIdKey: ${key}`);
      return key;
    }

    // Look for idKey with common postfix
    if (this.globalNodeOptions?.commonRdoFieldnamePostfix) {
      const defaultIdKeyWithPostfix = `${config.defaultIdKey}${this.globalNodeOptions.commonRdoFieldnamePostfix}`;
      if (defaultIdKeyWithPostfix in item) {
        const key = item[defaultIdKeyWithPostfix];
        logger.trace(`makeCollectionKey - sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - making key from defaultIdKeyWithPostfix: ${key}`);
        return key;
      }
    }

    throw new Error(`Path: ${this.wrappedSourceNode.sourceNodePath} - could not find makeKeyFromRdoElement implementation either via config or interface. See documentation for details`);
  };

  public makeRdoElement(sourceObject) {
    let rdo: any = undefined;
    if (this.getNodeOptions()?.makeRdo) {
      rdo = this.getNodeOptions()!.makeRdo!(sourceObject, this);
      logger.trace(`makeRdoElement - sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - making RDO from nodeOptions`, sourceObject, rdo);
    }

    if (!rdo && isIMakeRdo(this.value)) {
      rdo = this.value.makeRdo(sourceObject, this);
      logger.trace(`makeRdoElement - sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - making RDO from IMakeRdo`, sourceObject, rdo);
    }

    if (!rdo && this.globalNodeOptions?.makeRdo) {
      rdo = this.globalNodeOptions.makeRdo(sourceObject, this);
      logger.trace(`makeRdoElement - sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - making RDO from globalNodeOptions`, sourceObject, rdo);
    }

    if (!rdo && NodeTypeUtils.isPrimitive(sourceObject)) {
      rdo = sourceObject;
      logger.trace(`makeRdoElement - sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - making RDO from primitive`, sourceObject, rdo);
    }

    // Auto-create Rdo object field if autoInstantiateRdoItems.collectionItemsAsObservableObjectLiterals
    // Note: this creates an observable tree in the exact shape of the source data
    // It is recommended to consistently use autoMakeRdo* OR consistently provide customMakeRdo methods. Blending both can lead to unexpected behavior
    // Keys made here, instantiation takes place in downstream constructors
    if (!rdo && this.globalNodeOptions?.autoInstantiateRdoItems?.collectionItemsAsObservableObjectLiterals) {
      rdo = sourceObject;
      logger.trace(`makeRdoElement - sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - making RDO from autoInstantiateRdoItems`, sourceObject, rdo);
    }

    return rdo;
  }

  public abstract elements(): Iterable<D>;
  public abstract childElementCount();
  public abstract clearElements();
  public abstract insertElement(key: string, value: D);
  public abstract deleteElement(key: string);
}
