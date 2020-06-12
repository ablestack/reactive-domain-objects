import { IRdoInternalNodeWrapper, IMakeCollectionKey, IRdoNodeWrapper, ISourceInternalNodeWrapper, ISourceNodeWrapper, IGraphSyncOptions, ISyncChildElement } from '../types';
import { NodeTypeUtils } from '../utilities/node-type.utils';
import { RdoSyncableCollectionINW } from './rdo-synchable-collection-inw';
import { RdoObjectINW } from './rdo-object-inw';
import { RdoArrayINW } from './rdo-array-inw';
import { RdoMapINW } from './rdo-map-inw';
import { RdoSetINW } from './rdo-set-inw';
import { RdoPrimitiveINW } from './rdo-primitive-inw';
import { Logger } from '../infrastructure/logger';
import { RdoCollectionNodeWrapperFactory } from './rdo-collection-node-wrapper-factory';

const logger = Logger.make('RdoNodeWrapperFactory');
export class RdoNodeWrapperFactory {
  public static make<S, D>({
    value,
    key,
    parent,
    wrappedSourceNode,
    syncChildElement,
    options,
  }: {
    value: any;
    key: string | undefined;
    parent: IRdoNodeWrapper | undefined;
    wrappedSourceNode: ISourceNodeWrapper;
    syncChildElement: ISyncChildElement<S, D>;
    options?: IGraphSyncOptions;
  }): IRdoNodeWrapper {
    const typeInfo = NodeTypeUtils.getRdoNodeType(value);

    switch (typeInfo.builtInType) {
      case '[object Boolean]':
      case '[object Date]':
      case '[object Number]':
      case '[object String]': {
        return new RdoPrimitiveINW({ value, wrappedSourceNode, typeInfo });
      }
      case '[object Object]': {
        if (!makeKey) throw new Error('RdoNodeWrapperFactory-make - makeKey required for non-primitive types');
        return new RdoObjectINW({ value, key, parent, wrappedSourceNode, syncChildElement, globalNodeOptions: options?.globalNodeOptions });
      }
      case '[object Array]':
      case '[object Map]':
      case '[object Set]': {
        return RdoCollectionNodeWrapperFactory.make({ value, key, parent, wrappedSourceNode, syncChildElement, options });
      }
      default: {
        throw new Error(`Unable to make IRdoInternalNodeWrapper for type: ${typeInfo.builtInType}`);
      }
    }
  }
}
