import { ISourceNodeWrapper, SourceNodeTypeInfo, INodeSyncOptions, IGlobalNodeOptions } from '../..';
import { SourceBaseNW } from '../base/source-base-nw';

export class SourcePrimitiveNW<S> extends SourceBaseNW<S> implements ISourceNodeWrapper<S> {
  private _value: S | null | undefined;

  constructor({
    value,
    sourceNodePath,
    key,
    typeInfo,
    lastSourceNode,
    matchingNodeOptions,
    globalNodeOptions,
  }: {
    value: S | null | undefined;
    sourceNodePath: string;
    key: string | undefined;
    typeInfo: SourceNodeTypeInfo;
    lastSourceNode: any;
    matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
    globalNodeOptions: IGlobalNodeOptions | undefined;
  }) {
    super({ sourceNodePath, key, typeInfo, lastSourceNode, matchingNodeOptions, globalNodeOptions });
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
