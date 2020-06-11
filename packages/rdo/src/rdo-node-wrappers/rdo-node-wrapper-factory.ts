import { IRdoInternalNodeWrapper, IMakeCollectionKey, IRdoNodeWrapper } from '../types';
import { NodeTypeUtils } from '../utilities/node-type.utils';
import { RdoSyncableCollectionINW } from './rdo-synchable-collection-inw';
import { RdoObjectINW } from './rdo-object-inw';
import { RdoArrayINW } from './rdo-array-inw';
import { RdoMapINW } from './rdo-map-inw';
import { RdoSetINW } from './rdo-set-inw';
import { RdoPrimitiveINW } from './rdo-primitive-inw';

export class RdoNodeWrapperFactory {
  public static make<D>(node: any, makeKey?: IMakeCollectionKey<D>): IRdoNodeWrapper {
    const typeInfo = NodeTypeUtils.getRdoNodeType(node);

    if (typeInfo.type === 'ISyncableCollection') {
      return new RdoSyncableCollectionINW({ node });
    } else {
      switch (typeInfo.builtInType) {
        case '[object Boolean]':
        case '[object Date]':
        case '[object Number]':
        case '[object String]': {
          return new RdoPrimitiveINW({ node, typeInfo });
        }
        case '[object Object]': {
          if (!makeKey) throw new Error('RdoNodeWrapperFactory-make - makeKey required for non-primitive types');
          return new RdoObjectINW({ node, makeKey });
        }
        case '[object Array]': {
          if (!makeKey) throw new Error('RdoNodeWrapperFactory-make - makeKey required for non-primitive types');
          return new RdoArrayINW({ node, makeKey });
        }
        case '[object Map]': {
          if (!makeKey) throw new Error('RdoNodeWrapperFactory-make - makeKey required for non-primitive types');
          return new RdoMapINW({ node, makeKey });
        }
        case '[object Set]': {
          if (!makeKey) throw new Error('RdoNodeWrapperFactory-make - makeKey required for non-primitive types');
          return new RdoSetINW({ node, makeKey });
        }
        default: {
          throw new Error(`Unable to make IRdoInternalNodeWrapper for type: ${typeInfo.builtInType}`);
        }
      }
    }
  }
}
