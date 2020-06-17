import { ISourceNodeWrapper, IGlobalNodeOptions, INodeSyncOptions } from '..';
import { NodeTypeUtils } from '../rdo-node-wrappers/utils/node-type.utils';
import { SourcePrimitiveNW } from './concrete/source-primitive-nw';
import { SourceObjectNW, SourceArrayNW } from '.';

export class SourceNodeWrapperFactory {
  private _globalNodeOptions: IGlobalNodeOptions | undefined;

  constructor({ globalNodeOptions }: { globalNodeOptions: IGlobalNodeOptions | undefined }) {
    this._globalNodeOptions = globalNodeOptions;
  }

  public make<S>({
    sourceNodePath,
    value,
    key,
    lastSourceNode,
    matchingNodeOptions,
  }: {
    sourceNodePath: string;
    value: any;
    key: string | undefined;
    lastSourceNode: any;
    matchingNodeOptions?: INodeSyncOptions<any, any> | undefined;
  }): ISourceNodeWrapper<S> {
    const typeInfo = NodeTypeUtils.getSourceNodeType(value);

    switch (typeInfo.kind) {
      case 'Primitive': {
        return new SourcePrimitiveNW<S>({ value, key, sourceNodePath, typeInfo, lastSourceNode, matchingNodeOptions, globalNodeOptions: this._globalNodeOptions });
      }
      case 'Object': {
        return new SourceObjectNW<S>({ value, sourceNodePath, key, typeInfo, lastSourceNode, matchingNodeOptions, globalNodeOptions: this._globalNodeOptions });
      }
      case 'Collection': {
        return new SourceArrayNW<S>({ value, sourceNodePath, key, typeInfo, lastSourceNode, matchingNodeOptions, globalNodeOptions: this._globalNodeOptions });
      }
      default: {
        throw new Error(`Unable to make IRdoInternalNodeWrapper for type: ${typeInfo.builtInType}`);
      }
    }
  }
}
