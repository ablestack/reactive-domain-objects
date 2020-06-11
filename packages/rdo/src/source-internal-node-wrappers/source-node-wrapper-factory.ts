import { IMakeCollectionKey, ISourceNodeWrapper } from '../types';
import { NodeTypeUtils } from '../utilities/node-type.utils';
import { SourceArrayINW } from './source-array-inw';
import { SourceObjectINW } from './source-object-inw';
import { SourcePrimitiveINW } from './source-primitive-inw';

export class SourceNodeWrapperFactory {
  public static make<D>({ node, sourceNodePath, makeKey }: { node: any; sourceNodePath: string; makeKey: IMakeCollectionKey<D> }): ISourceNodeWrapper {
    const typeInfo = NodeTypeUtils.getSourceNodeType(node);

    switch (typeInfo.kind) {
      case 'Primitive': {
        return new SourcePrimitiveINW({ node, sourceNodePath, typeInfo });
      }
      case 'Object': {
        return new SourceObjectINW({ node, sourceNodePath, makeKey });
      }
      case 'Collection': {
        return new SourceArrayINW({ node, sourceNodePath, makeKey });
      }
      default: {
        throw new Error(`Unable to make IRdoInternalNodeWrapper for type: ${typeInfo.builtInType}`);
      }
    }
  }
}
