import { ISourceInternalNodeWrapper, IMakeCollectionKey } from '../types';
import { NodeTypeUtils } from '../utilities/node-type.utils';
import { SourceObjectINW } from './source-object-inw';
import { SourceArrayINW } from './source-array-inw';

export class SourceInternalNodeWrapperFactory {
  public static make<D>(node: any, makeKey: IMakeCollectionKey<D>): ISourceInternalNodeWrapper<D> {
    const sourceNodeType = NodeTypeUtils.getSourceNodeType(node);

    switch (sourceNodeType.type) {
      case 'Object': {
        return new SourceObjectINW({ node, makeKey });
      }
      case 'Collection': {
        return new SourceArrayINW({ node, makeKey });
      }
      case 'Primitive': {
        throw new Error(`IRdoInternalNodeWrapper not available for primitive types. Was attempted with: ${sourceNodeType.builtInType}`);
      }
      default: {
        throw new Error(`Unable to make IRdoInternalNodeWrapper for type: ${sourceNodeType.builtInType}`);
      }
    }
  }
}
