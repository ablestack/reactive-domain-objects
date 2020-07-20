import { ISourceNodeWrapper, NodeTypeInfo, INodeSyncOptions, IGlobalNodeOptions } from '../..';
import { SourceBaseNW } from '../base/source-base-nw';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';

export class SourcePrimitiveNW<S, D> extends SourceBaseNW<S, D> implements ISourceNodeWrapper<S, D> {
  private _value: S | null | undefined;

  constructor({
    value,
    sourceNodeTypePath,
    sourceNodeInstancePath,
    key,
    typeInfo,
    matchingNodeOptions,
    globalNodeOptions,
  }: {
    value: S | null | undefined;
    sourceNodeTypePath: string;
    sourceNodeInstancePath: string;
    key: string | number | undefined;
    typeInfo: NodeTypeInfo;
    matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
    globalNodeOptions: IGlobalNodeOptions | undefined;
  }) {
    super({ sourceNodeTypePath, sourceNodeInstancePath, key, typeInfo, matchingNodeOptions, globalNodeOptions });
    this._value = value;
  }

  //------------------------------
  // ISourceNodeWrapper
  //------------------------------

  public get value() {
    return this._value;
  }

  childElementCount(): number {
    return 0;
  }
}
