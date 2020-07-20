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

  public make<S, D>({
    sourceNodeTypePath,
    sourceNodeInstancePath,
    value,
    key,
    matchingNodeOptions,
  }: {
    sourceNodeTypePath: string;
    sourceNodeInstancePath: string;
    value: any;
    key: string | number | undefined; // Key should only even be undefined on root object
    matchingNodeOptions?: INodeSyncOptions<S, D> | undefined;
  }): ISourceNodeWrapper<S, D> {
    const typeInfo = NodeTypeUtils.getNodeType(value);

    switch (typeInfo.kind) {
      case 'Primitive': {
        return new SourcePrimitiveNW<S, D>({ value, key, sourceNodeTypePath, sourceNodeInstancePath, typeInfo, matchingNodeOptions, globalNodeOptions: this._globalNodeOptions });
      }
      case 'Object': {
        const o = new SourceObjectNW<S, D>({ value, sourceNodeTypePath, sourceNodeInstancePath, key, typeInfo, matchingNodeOptions, globalNodeOptions: this._globalNodeOptions });
        return (o as unknown) as ISourceNodeWrapper<S, D>;
      }
      case 'Collection': {
        return new SourceArrayNW<S, D>({ value, sourceNodeTypePath, sourceNodeInstancePath, key, typeInfo, matchingNodeOptions, globalNodeOptions: this._globalNodeOptions });
      }
      default: {
        throw new Error(`Unable to make IRdoInternalNodeWrapper for type: ${typeInfo.stringifiedType}`);
      }
    }
  }
}
