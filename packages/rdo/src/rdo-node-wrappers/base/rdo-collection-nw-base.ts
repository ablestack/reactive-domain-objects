import { RdoInternalNWBase } from './rdo-internal-nw-base';
import { Logger } from '../../infrastructure/logger';
import { IRdoCollectionNodeWrapper, IMakeCollectionKey, IMakeRdo, RdoNodeTypeInfo, IRdoNodeWrapper, ISourceNodeWrapper, ISyncChildNode, INodeSyncOptions, IGlobalNameOptions } from '../..';

const logger = Logger.make('RdoCollectionNWBase');

export abstract class RdoCollectionNWBase<S, D> extends RdoInternalNWBase<S, D> implements IRdoCollectionNodeWrapper<S, D> {
  private _makeItemKey: IMakeCollectionKey<D>;
  private _makeItem: IMakeRdo<S, D> | undefined;

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
    super({
      typeInfo,
      key,
      wrappedParentRdoNode,
      wrappedSourceNode,
      syncChildNode,
      matchingNodeOptions,
      globalNodeOptions,
    });
    // this._makeItemKey = makeItemKey;
    // this._makeItem = makeItem;
  }

  //------------------------------
  // IRdoCollectionNodeWrapper
  //------------------------------
  public get makeItemKey() {
    return this._makeItemKey;
  }

  public get makeItem() {
    return this._makeItem;
  }

  public abstract childElementCount();
  public abstract clearItems();
  public abstract insertItem(value: D);
  public abstract deleteItem(key: string);
}
