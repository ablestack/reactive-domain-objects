import { Logger } from '../../infrastructure/logger';
import { RdoNWBase } from './rdo-nw-base';
import { IRdoInternalNodeWrapper, ISyncChildNode, RdoNodeTypeInfo, IRdoNodeWrapper, ISourceNodeWrapper, INodeSyncOptions, IGlobalNodeOptions } from '../..';

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
    super({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray });
    this._syncChildNode = syncChildNode;
  }

  //------------------------------
  // IRdoInternalNodeWrapper
  //------------------------------
  public abstract itemKeys();
  public abstract getElement(key: string);
  public abstract updateElement(key: string, value: D);
}
