import { Logger } from '../infrastructure/logger';
import { IRdoNodeWrapper, ISourceNodeWrapper, ISyncChildNode, IGlobalPropertyNameTransformation, INodeSyncOptions, IWrapRdoNode } from '..';
import { NodeTypeUtils } from './utils/node-type.utils';
import { RdoPrimitiveNW, RdoObjectNW, RdoCollectionNodeWrapperFactory } from '.';

const logger = Logger.make('RdoNodeWrapperFactory');
export class RdoNodeWrapperFactory {
  private _syncChildNode: ISyncChildNode<S, D>;
  private _globalNodeOptions: IGlobalPropertyNameTransformation | undefined;
  private _wrapRdoNode: IWrapRdoNode;

  constructor({ syncChildNode, globalNodeOptions, wrapRdoNode }: { syncChildNode: ISyncChildNode<S, D>; globalNodeOptions: IGlobalPropertyNameTransformation | undefined; wrapRdoNode: IWrapRdoNode }) {
    this._syncChildNode = syncChildNode;
    this._globalNodeOptions = globalNodeOptions;
    this._wrapRdoNode = wrapRdoNode;
  }

  public make<S, D>({
    value,
    key,
    parent,
    wrappedSourceNode,
    matchingNodeOptions,
  }: {
    value: D | Iterable<D>;
    key: string | undefined;
    parent: IRdoNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S>;
    matchingNodeOptions?: INodeSyncOptions<any, any> | undefined;
  }): IRdoNodeWrapper<S, D> {
    const typeInfo = NodeTypeUtils.getRdoNodeType(value);

    switch (typeInfo.builtInType) {
      case '[object Boolean]':
      case '[object Date]':
      case '[object Number]':
      case '[object String]': {
        return new RdoPrimitiveNW<S, D>({ value, key, parent, wrappedSourceNode, typeInfo });
      }
      case '[object Object]': {
        return new RdoObjectNW({ value, key, parent, wrappedSourceNode, syncChildNode: this._syncChildNode, globalNodeOptions: options?.globalNodeOptions });
      }
      case '[object Array]':
      case '[object Map]':
      case '[object Set]': {
        return RdoCollectionNodeWrapperFactory.make({ value, key, parent, wrappedSourceNode, syncChildNode: this._syncChildNode, options });
      }
      default: {
        throw new Error(`Unable to make IRdoInternalNodeWrapper for type: ${typeInfo.builtInType}`);
      }
    }
  }
}
