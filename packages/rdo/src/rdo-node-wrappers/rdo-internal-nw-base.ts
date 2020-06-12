import { ISourceNodeWrapper, RdoNodeTypeInfo } from '..';
import { Logger } from '../infrastructure/logger';
import { IRdoInternalNodeWrapper, IRdoNodeWrapper, ISyncChildElement } from '../types';
import { RdoNWBase } from './rdo-nw-base';

const logger = Logger.make('RdoMapNW');

export abstract class RdoInternalNWBase<S, D> extends RdoNWBase<S, D> implements IRdoInternalNodeWrapper<S, D> {
  protected _syncChildElement: ISyncChildElement<S, D>;

  constructor({
    typeInfo,
    key,
    parent,
    wrappedSourceNode,
    syncChildElement,
  }: {
    typeInfo: RdoNodeTypeInfo;
    key: string | undefined;
    parent: IRdoNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S>;
    syncChildElement: ISyncChildElement<S, D>;
  }) {
    super({ typeInfo, key, parent, wrappedSourceNode });
    this._syncChildElement = syncChildElement;
  }

  //------------------------------
  // IRdoInternalNodeWrapper
  //------------------------------
  public abstract itemKeys();
  public abstract getItem(key: string);
  public abstract updateItem(key: string, value: D);
}
