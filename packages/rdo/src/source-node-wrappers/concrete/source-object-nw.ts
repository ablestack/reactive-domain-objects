import { ISourceObjectNodeWrapper, NodeTypeInfo, MakeCollectionKeyMethod, INodeSyncOptions, IGlobalNodeOptions } from '../..';
import { SourceBaseNW } from '../base/source-base-nw';

export class SourceObjectNW<S extends Record<string | number, any>, D> extends SourceBaseNW<S, D> implements ISourceObjectNodeWrapper<S, D> {
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

  public childElementCount(): number {
    return 0;
  }

  //------------------------------
  // ISourceObjectNodeWrapper
  //------------------------------

  //@ts-ignore
  public getNodeKeys(): (string | number)[] {
    return ((this._value && Object.keys(this._value)) || []) as (string | number)[];
  }

  public getNodeItem(key: string | number) {
    return this._value && this._value[key];
  }
}
