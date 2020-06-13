import { Logger } from '../../infrastructure/logger';
import { RdoNWBase } from '.';
import { IRdoInternalNodeWrapper, ISyncChildNode, RdoNodeTypeInfo, IRdoNodeWrapper, ISourceNodeWrapper, INodeSyncOptions, IGlobalNameOptions } from '../..';

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
  }: {
    typeInfo: RdoNodeTypeInfo;
    key: string | undefined;
    wrappedParentRdoNode: IRdoNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S>;
    syncChildNode: ISyncChildNode<S, D>;
    matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
    globalNodeOptions: IGlobalNameOptions | undefined;
  }) {
    super({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, matchingNodeOptions, globalNodeOptions });
    this._syncChildNode = syncChildNode;
  }

  //------------------------------
  // IRdoInternalNodeWrapper
  //------------------------------
  public abstract itemKeys();
  public abstract getItem(key: string);
  public abstract updateItem(key: string, value: D);
}
