import { IRdoInternalNodeWrapper, IMakeCollectionKey } from '../types';
import { NodeTypeUtils } from '../utilities/node-type.utils';
import { RdoSyncableCollectionINW } from './rdo-synchable-collection-inw';
import { RdoObjectINW } from './rdo-object-inw';
import { RdoArrayINW } from './rdo-array-inw';
import { RdoMapINW } from './rdo-map-inw';
import { RdoSetINW } from './rdo-set-inw';

export class RdoInternalNodeWrapperFactory {
  public static make<D>(node: any, makeKey: IMakeCollectionKey<D>): IRdoInternalNodeWrapper<D> {
    const rdoNodeType = NodeTypeUtils.getRdoNodeType(node);

    if (rdoNodeType.type === 'ISyncableCollection') {
      return new RdoSyncableCollectionINW({ node });
    } else {
      switch (rdoNodeType.builtInType) {
        case '[object Object]': {
          return new RdoObjectINW({ node, makeKey });
        }
        case '[object Array]': {
          return new RdoArrayINW({ node, makeKey });
        }
        case '[object Map]': {
          return new RdoMapINW({ node, makeKey });
        }
        case '[object Set]': {
          return new RdoSetINW({ node, makeKey });
        }
        case '[object Boolean]':
        case '[object Date]':
        case '[object Number]':
        case '[object String]': {
          throw new Error(`IRdoInternalNodeWrapper not available for primitive types. Was attempted with: ${rdoNodeType.builtInType}`);
        }
        default: {
          throw new Error(`Unable to make IRdoInternalNodeWrapper for type: ${rdoNodeType.builtInType}`);
        }
      }
    }
  }
}
