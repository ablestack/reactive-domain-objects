import { ISourceNodeWrapper, IGlobalNodeOptions, INodeSyncOptions } from '..';
import { NodeTypeUtils } from '../rdo-node-wrappers/utils/node-type.utils';
import { SourcePrimitiveNW } from './concrete/source-primitive-nw';
import { SourceObjectNW, SourceArrayNW } from '.';

export class SourceNodeWrapperFactory {
  private _globalNodeOptions: IGlobalNodeOptions | undefined;

  constructor({ globalNodeOptions }: { globalNodeOptions: IGlobalNodeOptions | undefined }) {
    this._globalNodeOptions = globalNodeOptions;
  }

  public make<K extends string | number, S, D>({
    sourceNodePath,
    value,
    key,
    lastSourceNode,
    matchingNodeOptions,
  }: {
    sourceNodePath: string;
    value: any;
    key: K | undefined; // Key should only even be undefined on root object
    lastSourceNode: any;
    matchingNodeOptions?: INodeSyncOptions<K, S, D> | undefined;
  }): ISourceNodeWrapper<K, S, D> {
    const typeInfo = NodeTypeUtils.getNodeType(value);

    switch (typeInfo.kind) {
      case 'Primitive': {
        return new SourcePrimitiveNW<K, S, D>({ value, key, sourceNodePath, typeInfo, lastSourceNode, matchingNodeOptions, globalNodeOptions: this._globalNodeOptions });
      }
      case 'Object': {
        if (typeof key === 'string' || typeof key === 'undefined') {
          const o = new SourceObjectNW<string, S, D>({ value, sourceNodePath, key, typeInfo, lastSourceNode, matchingNodeOptions, globalNodeOptions: this._globalNodeOptions });
          return (o as unknown) as ISourceNodeWrapper<K, S, D>;
        } else {
          throw new Error(`Key for SourceObjects must be of type string (or undefined in the case of the root element). Found key of type ${typeof key}`);
        }
      }
      case 'Collection': {
        return new SourceArrayNW<K, S, D>({ value, sourceNodePath, key, typeInfo, lastSourceNode, matchingNodeOptions, globalNodeOptions: this._globalNodeOptions });
      }
      default: {
        throw new Error(`Unable to make IRdoInternalNodeWrapper for type: ${typeInfo.builtInType}`);
      }
    }
  }
}
