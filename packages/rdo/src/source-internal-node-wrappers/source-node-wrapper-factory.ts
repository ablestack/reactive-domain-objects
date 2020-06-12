import { IMakeCollectionKey, ISourceNodeWrapper } from '../types';
import { NodeTypeUtils } from '../utilities/node-type.utils';
import { SourceArrayINW } from './source-array-inw';
import { SourceObjectINW } from './source-object-inw';
import { SourcePrimitiveINW } from './source-primitive-inw';

export class SourceNodeWrapperFactory {
  public static make<D>({ sourceNodePath, node, lastSourceNode }: { sourceNodePath: string; node: any; lastSourceNode: any }): ISourceNodeWrapper {
    const typeInfo = NodeTypeUtils.getSourceNodeType(node);

    switch (typeInfo.kind) {
      case 'Primitive': {
        return new SourcePrimitiveINW({ value: node, sourceNodePath, typeInfo, lastSourceNode });
      }
      case 'Object': {
        return new SourceObjectINW({ value: node, sourceNodePath, typeInfo, lastSourceNode, makeKey });
      }
      case 'Collection': {
        return new SourceArrayINW({ node, sourceNodePath, typeInfo, lastSourceNode, makeItemKey: makeKey });
      }
      default: {
        throw new Error(`Unable to make IRdoInternalNodeWrapper for type: ${typeInfo.builtInType}`);
      }
    }
  }
}
