import { ISourceNodeWrapper, IGlobalNodeOptions, INodeSyncOptions } from '..';
import { NodeTypeUtils } from '../rdo-node-wrappers/utils/node-type.utils';
import { SourcePrimitiveNW } from './concrete/source-primitive-nw';
import { SourceObjectNW, SourceArrayNW } from '.';
import { MutableNodeCache } from '../infrastructure/mutable-node-cache';

export class SourceNodeWrapperFactory {
  private _globalNodeOptions: IGlobalNodeOptions | undefined;

  constructor({ globalNodeOptions }: { globalNodeOptions: IGlobalNodeOptions | undefined }) {
    this._globalNodeOptions = globalNodeOptions;
  }

  public make<K extends string | number, S, D>({
    sourceNodeTypePath,
    sourceNodeInstancePath,
    value,
    key,
    matchingNodeOptions,
  }: {
    sourceNodeTypePath: string;
    sourceNodeInstancePath: string;
    value: any;
    key: K | undefined; // Key should only even be undefined on root object
    matchingNodeOptions?: INodeSyncOptions<K, S, D> | undefined;
  }): ISourceNodeWrapper<K, S, D> {
    const typeInfo = NodeTypeUtils.getNodeType(value);

    switch (typeInfo.kind) {
      case 'Primitive': {
        return new SourcePrimitiveNW<K, S, D>({ value, key, sourceNodeTypePath, sourceNodeInstancePath, typeInfo, matchingNodeOptions, globalNodeOptions: this._globalNodeOptions });
      }
      case 'Object': {
        const o = new SourceObjectNW<K, S, D>({ value, sourceNodeTypePath, sourceNodeInstancePath, key, typeInfo, matchingNodeOptions, globalNodeOptions: this._globalNodeOptions });
        return (o as unknown) as ISourceNodeWrapper<K, S, D>;
      }
      case 'Collection': {
        return new SourceArrayNW<K, S, D>({ value, sourceNodeTypePath, sourceNodeInstancePath, key, typeInfo, matchingNodeOptions, globalNodeOptions: this._globalNodeOptions });
      }
      default: {
        throw new Error(`Unable to make IRdoInternalNodeWrapper for type: ${typeInfo.stringifiedType}`);
      }
    }
  }
}
