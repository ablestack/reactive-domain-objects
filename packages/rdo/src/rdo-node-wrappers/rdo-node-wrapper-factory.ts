import { Logger } from '../infrastructure/logger';
import { IRdoNodeWrapper, ISourceNodeWrapper, ISyncChildNode, IGlobalPropertyNameTransformation, INodeSyncOptions } from '..';
import { NodeTypeUtils } from './utils/node-type.utils';
import { RdoPrimitiveNW, RdoObjectNW, RdoCollectionNodeWrapperFactory } from '.';

const logger = Logger.make('RdoNodeWrapperFactory');
export class RdoNodeWrapperFactory {
  public static make<S, D>({
    value,
    key,
    parent,
    wrappedSourceNode,
    syncChildNode,
    globalNodeOptions,
    matchingNodeOptions,
  }: {
    value: D | Iterable<D>;
    key: string | undefined;
    parent: IRdoNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S>;
    syncChildNode: ISyncChildNode<S, D>;
    globalNodeOptions: IGlobalPropertyNameTransformation | undefined;
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
        return new RdoObjectNW({ value, key, parent, wrappedSourceNode, syncChildNode, globalNodeOptions: options?.globalNodeOptions });
      }
      case '[object Array]':
      case '[object Map]':
      case '[object Set]': {
        return RdoCollectionNodeWrapperFactory.make({ value, key, parent, wrappedSourceNode, syncChildNode, options });
      }
      default: {
        throw new Error(`Unable to make IRdoInternalNodeWrapper for type: ${typeInfo.builtInType}`);
      }
    }
  }
}
