import { IGlobalNodeOptions, INodeSyncOptions, IRdoCollectionNodeWrapper, IRdoNodeWrapper, ISourceNodeWrapper, ISyncChildNode, RdoNodeTypeInfo, config } from '../..';
import { Logger } from '../../infrastructure/logger';
import { RdoInternalNWBase } from './rdo-internal-nw-base';
import { NodeTypeUtils } from '../utils/node-type.utils';
import { isIMakeCollectionKeyFromRdoElement, isIMakeRdo } from '../../types';
import { observable } from 'mobx';

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
  }: {
    typeInfo: RdoNodeTypeInfo;
    key: string | undefined;
    wrappedParentRdoNode: IRdoNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S>;
    syncChildNode: ISyncChildNode<S, D>;
    matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
    globalNodeOptions: IGlobalNodeOptions | undefined;
    targetedOptionMatchersArray: Array<INodeSyncOptions<any, any>>;
  }) {
    super({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray });
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
      return this.getNodeOptions()!.makeRdoCollectionKey!.fromRdoElement(item);
    }

    if (isIMakeCollectionKeyFromRdoElement(this.value)) {
      return this.value.makeCollectionKeyFromRdoElement(item);
    }

    // If primitive, the item is the key
    if (NodeTypeUtils.isPrimitive(item)) {
      return String(item);
    }

    // Last option - look for idKey
    if (item[config.defaultIdKey]) {
      return item[config.defaultIdKey];
    }

    throw new Error(`Path: ${this.wrappedSourceNode.sourceNodePath} - could not find makeKeyFromRdoElement implementation either via config or interface. See documentation for details`);
  };

  public makeRdoElement(sourceObject) {
    let rdo: any = undefined;
    if (this.getNodeOptions()?.makeRdo) {
      rdo = this.getNodeOptions()!.makeRdo!(sourceObject, this);
    }

    if (!rdo && isIMakeRdo(this.value)) {
      rdo = this.value.makeRdo(sourceObject, this);
    }

    if (!rdo && this.globalNodeOptions?.makeRdo) {
      return this.globalNodeOptions.makeRdo(sourceObject, this);
    }

    if (!rdo && this.globalNodeOptions?.makeRdo) {
      return this.globalNodeOptions.makeRdo(sourceObject, this);
    }

    // Auto-create Rdo collectionItem if autoInstantiateRdoItems.collectionItemsAsObservableObjectLiterals
    // Note: this uses MobX to create an observable tree in the exact shape
    // of the source data, regardless of  original TypeScript typing of the collection items
    // It is recommended to consistently use autoMakeRdo* OR consistently provide customMakeRdo methods
    // Blending both can lead to unexpected behavior
    if (!rdo && this.globalNodeOptions?.autoInstantiateRdoItems?.collectionItemsAsObservableObjectLiterals) {
      rdo = observable(sourceObject);
    }

    return undefined;
  }

  public abstract elements(): Iterable<D>;
  public abstract childElementCount();
  public abstract clearElements();
  public abstract insertElement(key: string, value: D);
  public abstract deleteElement(key: string);
}
