import { IGlobalNameOptions, INodeSyncOptions, IRdoCollectionNodeWrapper, IRdoNodeWrapper, ISourceNodeWrapper, ISyncChildNode, RdoNodeTypeInfo, config } from '../..';
import { Logger } from '../../infrastructure/logger';
import { RdoInternalNWBase } from './rdo-internal-nw-base';
import { NodeTypeUtils } from '../utils/node-type.utils';
import { isIMakeCollectionKeyFromRdoElement, isIMakeRdo } from '../../types';

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
  }: {
    typeInfo: RdoNodeTypeInfo;
    key: string | undefined;
    wrappedParentRdoNode: IRdoNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S>;
    syncChildNode: ISyncChildNode<S, D>;
    matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
    globalNodeOptions: IGlobalNameOptions | undefined;
  }) {
    super({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions });
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

  public makeCollectionKey(item: D) {
    // Use IMakeCollectionKey provided on options if available
    if (this.matchingNodeOptions?.makeRdoCollectionKey?.fromRdoElement) {
      return this.matchingNodeOptions.makeRdoCollectionKey.fromRdoElement(item);
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

    throw new Error(`could not find makeKeyFromRdoElement implementation either via config or interface. See documentation for details`);
  }

  public makeRdo(sourceObject) {
    // Use IMakeCollectionKey provided on options if available
    if (this.matchingNodeOptions?.makeRdo) {
      return this.matchingNodeOptions.makeRdo(sourceObject);
    }

    if (isIMakeRdo(this.value)) {
      return this.value.makeRdo(sourceObject);
    }

    return undefined;
  }

  public abstract elements(): Iterable<D>;
  public abstract childElementCount();
  public abstract clearElements();
  public abstract insertElement(value: D);
  public abstract deleteElement(key: string);
}
