import { IMakeCollectionKey, ISourceNodeWrapper } from '../types';
import { NodeTypeUtils } from '../utilities/node-type.utils';
import { SourceArrayINW } from './source-array-inw';
import { SourceObjectINW } from './source-object-inw';
import { SourcePrimitiveINW } from './source-primitive-inw';

export class SourceInternalNodeWrapperFactory {
  public static make<D>(node: any, makeKey: IMakeCollectionKey<D>): ISourceNodeWrapper {
    const typeInfo = NodeTypeUtils.getSourceNodeType(node);

    switch (typeInfo.type) {
      case 'Primitive': {
        return new SourcePrimitiveINW({ node, typeInfo });
      }
      case 'Object': {
        return new SourceObjectINW({ node, makeKey });
      }
      case 'Array': {
        return new SourceArrayINW({ node, makeKey });
      }
      default: {
        throw new Error(`Unable to make IRdoInternalNodeWrapper for type: ${typeInfo.builtInType}`);
      }
    }
  }
}
