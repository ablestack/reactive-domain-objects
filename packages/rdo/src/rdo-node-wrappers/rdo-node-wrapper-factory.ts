import { Logger } from '../infrastructure/logger';
import { IRdoNodeWrapper, ISourceNodeWrapper, ISyncChildNode, IGlobalNameOptions, INodeSyncOptions, IWrapRdoNode, IEqualityComparer } from '..';
import { NodeTypeUtils } from './utils/node-type.utils';
import { RdoPrimitiveNW, RdoObjectNW, RdoCollectionNodeWrapperFactory, RdoArrayNW, RdoMapNW, RdoSetNW } from '.';

const logger = Logger.make('RdoNodeWrapperFactory');

export class RdoNodeWrapperFactory {
  private _syncChildNode: ISyncChildNode<any, any>;
  private _globalNodeOptions: IGlobalNameOptions | undefined;
  private _wrapRdoNode: IWrapRdoNode;
  private _defaultEqualityComparer: IEqualityComparer;

  constructor({
    syncChildNode,
    globalNodeOptions,
    wrapRdoNode,
    defaultEqualityComparer,
  }: {
    syncChildNode: ISyncChildNode<any, any>;
    globalNodeOptions: IGlobalNameOptions | undefined;
    wrapRdoNode: IWrapRdoNode;
    defaultEqualityComparer: IEqualityComparer;
  }) {
    this._syncChildNode = syncChildNode;
    this._globalNodeOptions = globalNodeOptions;
    this._wrapRdoNode = wrapRdoNode;
    this._defaultEqualityComparer = defaultEqualityComparer;
  }

  public make<S, D>({
    value,
    key,
    wrappedParentRdoNode,
    wrappedSourceNode,
    matchingNodeOptions,
  }: {
    value: D;
    key: string | undefined;
    wrappedParentRdoNode: IRdoNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S>;
    matchingNodeOptions?: INodeSyncOptions<any, any> | undefined;
  }): IRdoNodeWrapper<S, D> {
    const typeInfo = NodeTypeUtils.getRdoNodeType(value);

    switch (typeInfo.builtInType) {
      case '[object Boolean]':
      case '[object Date]':
      case '[object Number]':
      case '[object String]': {
        return new RdoPrimitiveNW<S, D>({ value, key, wrappedParentRdoNode, wrappedSourceNode, typeInfo, matchingNodeOptions, globalNodeOptions: this._globalNodeOptions });
      }
      case '[object Object]': {
        return new RdoObjectNW({
          value,
          key,
          wrappedParentRdoNode,
          wrappedSourceNode,
          typeInfo,
          defaultEqualityComparer: this._defaultEqualityComparer,
          syncChildNode: this._syncChildNode,
          wrapRdoNode: this._wrapRdoNode,
          matchingNodeOptions,
          globalNodeOptions: this._globalNodeOptions,
        });
      }
      case '[object Array]': {
        return new RdoArrayNW<S, D>({ value, typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode: this._syncChildNode, matchingNodeOptions, globalNodeOptions: this._globalNodeOptions });
      }
      case '[object Map]': {
        //return new RdoMapNW({ value, key, parent, wrappedSourceNode, syncChildNode makeKey });
      }
      case '[object Set]': {
        //return new RdoSetNW({ value, key, parent, wrappedSourceNode, syncChildNode makeKey });
      }
      default: {
        throw new Error(`Unable to make IRdoInternalNodeWrapper for type: ${typeInfo.builtInType}`);
      }
    }
  }
}
