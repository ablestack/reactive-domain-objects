import { ISourceNodeWrapper, NodeTypeInfo, INodeSyncOptions, IGlobalNodeOptions } from '../..';
import { SourceBaseNW } from '../base/source-base-nw';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';

export class SourcePrimitiveNW<K extends string | number, S, D> extends SourceBaseNW<K, S, D> implements ISourceNodeWrapper<K, S, D> {
  private _value: S | null | undefined;

  constructor({
    value,
    sourceNodePath,
    key,
    typeInfo,
    matchingNodeOptions,
    globalNodeOptions,
  }: {
    value: S | null | undefined;
    sourceNodePath: string;
    key: K | undefined;
    typeInfo: NodeTypeInfo;
    matchingNodeOptions: INodeSyncOptions<any, any, any> | undefined;
    globalNodeOptions: IGlobalNodeOptions | undefined;
  }) {
    super({ sourceNodePath, key, typeInfo, matchingNodeOptions, globalNodeOptions });
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
