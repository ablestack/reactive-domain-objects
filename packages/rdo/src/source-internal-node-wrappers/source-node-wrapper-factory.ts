import { IMakeCollectionKey, ISourceNodeWrapper } from '../types';
import { NodeTypeUtils } from '../utilities/node-type.utils';
import { SourceArrayNW } from './source-array-inw';
import { SourceObjectNW } from './source-object-inw';
import { SourcePrimitiveNW } from './source-primitive-inw';

export class SourceNodeWrapperFactory {
  public static make<D>({ sourceNodePath, node, lastSourceNode }: { sourceNodePath: string; node: any; lastSourceNode: any }): ISourceNodeWrapper {
    const typeInfo = NodeTypeUtils.getSourceNodeType(node);

    switch (typeInfo.kind) {
      case 'Primitive': {
        return new SourcePrimitiveNW({ value: node, sourceNodePath, typeInfo, lastSourceNode });
      }
      case 'Object': {
        return new SourceObjectNW({ value: node, sourceNodePath, typeInfo, lastSourceNode, makeKey });
      }
      case 'Collection': {
        return new SourceArrayNW({ node, sourceNodePath, typeInfo, lastSourceNode, makeItemKey: makeKey });
      }
      default: {
        throw new Error(`Unable to make IRdoInternalNodeWrapper for type: ${typeInfo.builtInType}`);
      }
    }
  }
}
