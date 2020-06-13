import { Logger } from '../../infrastructure/logger';
import { RdoNWBase } from '.';
import { IRdoInternalNodeWrapper, ISyncChildNode, RdoNodeTypeInfo, IRdoNodeWrapper, ISourceNodeWrapper } from '../..';

const logger = Logger.make('RdoMapNW');

export abstract class RdoInternalNWBase<S, D> extends RdoNWBase<S, D> implements IRdoInternalNodeWrapper<S, D> {
  protected _syncChildNode: ISyncChildNode<S, D>;

  constructor({
    typeInfo,
    key,
    parent,
    wrappedSourceNode,
    syncChildNode,
  }: {
    typeInfo: RdoNodeTypeInfo;
    key: string | undefined;
    parent: IRdoNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S>;
    syncChildNode: ISyncChildNode<S, D>;
  }) {
    super({ typeInfo, key, parent, wrappedSourceNode });
    this._syncChildNode = syncChildNode;
  }

  //------------------------------
  // IRdoInternalNodeWrapper
  //------------------------------
  public abstract itemKeys();
  public abstract getItem(key: string);
  public abstract updateItem(key: string, value: D);
}
