import { Logger } from '../../infrastructure/logger';
import { RdoNWBase } from './rdo-nw-base';
import { IRdoInternalNodeWrapper, ISyncChildNode, NodeTypeInfo, IRdoNodeWrapper, ISourceNodeWrapper, INodeSyncOptions, IGlobalNodeOptions, isIMakeRdo, NodeTypeUtils } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { NodeChange } from '../../types/event-types';
import { observable } from 'mobx';

const logger = Logger.make('RdoMapNW');

export abstract class RdoInternalNWBase<S, D> extends RdoNWBase<S, D> implements IRdoInternalNodeWrapper<S, D> {
  protected _syncChildNode: ISyncChildNode<S, D>;

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
    typeInfo: NodeTypeInfo;
    key: string | undefined;
    wrappedParentRdoNode: IRdoInternalNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S>;
    syncChildNode: ISyncChildNode<S, D>;
    matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
    globalNodeOptions: IGlobalNodeOptions | undefined;
    targetedOptionMatchersArray: Array<INodeSyncOptions<any, any>>;
    eventEmitter: EventEmitter<NodeChange>;
  }) {
    super({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
    this._syncChildNode = syncChildNode;
  }

  //------------------------------
  // IRdoInternalNodeWrapper
  //------------------------------
  public makeRdoElement(sourceObject: any) {
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
      rdo = this.autoInstantiateNode(sourceObject);

      logger.trace(`makeRdoElement - sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - making RDO from autoInstantiateRdoItems`, sourceObject, rdo);
    }

    return rdo;
  }

  public abstract itemKeys();
  public abstract getItem(key: string);
  public abstract updateItem(key: string, value: D);
  public abstract insertItem(key: string, value: D);

  //------------------------------
  // Private
  //------------------------------

  //
  // Just needs to return empty objects or collections, as these will get synced downstream
  private autoInstantiateNode(sourceObject: any) {
    const typeInfo = NodeTypeUtils.getNodeType(sourceObject);

    switch (typeInfo.kind) {
      case 'Primitive': {
        return observable.box(sourceObject);
      }
      case 'Collection': {
        return observable(new Array());
      }
      case 'Object': {
        return observable(new Object());
      }
    }
  }
}
