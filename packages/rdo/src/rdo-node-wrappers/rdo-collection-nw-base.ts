import { IMakeCollectionKey, IRdoCollectionNodeWrapper, RdoNodeTypeInfo, ISourceNodeWrapper, isISourceCollectionNodeWrapper, SyncUtils, ISyncChildElement } from '..';
import { Logger } from '../infrastructure/logger';
import { isISourceInternalNodeWrapper, IRdoNodeWrapper, IMakeRdo } from '../types';
import { RdoInternalNWBase } from './rdo-internal-nw-base';

const logger = Logger.make('RdoCollectionNWBase');

export abstract class RdoCollectionNWBase<S, D> extends RdoInternalNWBase<S, D> implements IRdoCollectionNodeWrapper<S, D> {
  private _makeItemKey: IMakeCollectionKey<D>;
  private _makeItem: IMakeRdo<S, D> | undefined;

  constructor({
    typeInfo,
    key,
    parent,
    wrappedSourceNode,
    makeItemKey,
    makeItem,
    syncChildElement,
  }: {
    typeInfo: RdoNodeTypeInfo;
    key: string | undefined;
    parent: IRdoNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S>;
    makeItemKey: IMakeCollectionKey<D>;
    makeItem: IMakeRdo<S, D> | undefined;
    syncChildElement: ISyncChildElement<S, D>;
  }) {
    super({
      typeInfo,
      key,
      parent,
      wrappedSourceNode,
      syncChildElement,
    });
    this._makeItemKey = makeItemKey;
    this._makeItem = makeItem;
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
