import { ISourceNodeWrapper } from '..';
import { NodeTypeUtils } from '../rdo-node-wrappers/utils/node-type.utils';
import { SourcePrimitiveNW } from './concrete/source-primitive-nw';
import { SourceObjectNW, SourceArrayNW } from '.';

export class SourceNodeWrapperFactory {
  constructor() {}

  public make<S>({ sourceNodePath, value, key, lastSourceNode }: { sourceNodePath: string; value: any; key: string | undefined; lastSourceNode: any }): ISourceNodeWrapper<S> {
    const typeInfo = NodeTypeUtils.getSourceNodeType(value);

    switch (typeInfo.kind) {
      case 'Primitive': {
        return new SourcePrimitiveNW<S>({ value, key, sourceNodePath, typeInfo, lastSourceNode });
      }
      case 'Object': {
        return new SourceObjectNW<S>({ value, sourceNodePath, key, typeInfo, lastSourceNode, makeKey });
      }
      case 'Collection': {
        return new SourceArrayNW<S>({ value, sourceNodePath, key, typeInfo, lastSourceNode, makeItemKey: makeKey });
      }
      default: {
        throw new Error(`Unable to make IRdoInternalNodeWrapper for type: ${typeInfo.builtInType}`);
      }
    }
  }
}
