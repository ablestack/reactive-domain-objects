import { IRdoInternalNodeWrapper, IMakeRdoCollectionKey } from '../types';
import { NodeTypeUtils } from '../utilities/node-type.utils';
import { SyncableRDOCollectionINW } from './syncable-rdo-collection-inw';
import { ObjectINW } from './object-inw';
import { ArrayINW } from './array-inw';
import { MapINW } from './map-inw';
import { SetINW } from './set-inw';

export class RdoInternalNodeWrapperFactory {
  public static make<D>(node: any, makeKey: IMakeRdoCollectionKey<D>): IRdoInternalNodeWrapper<D> {
    const rdoNodeType = NodeTypeUtils.getRdoNodeType(node);

    if (rdoNodeType.type === 'ISyncableCollection') {
      return new SyncableRDOCollectionINW({ node });
    } else {
      switch (rdoNodeType.builtInType) {
        case '[object Object]': {
          return new ObjectINW({ node, makeKey });
        }
        case '[object Array]': {
          return new ArrayINW({ node, makeKey });
        }
        case '[object Map]': {
          return new MapINW({ node, makeKey });
        }
        case '[object Set]': {
          return new SetINW({ node, makeKey });
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
