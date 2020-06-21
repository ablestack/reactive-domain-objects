import { ISourceInternalNodeWrapper, NodeTypeInfo, MakeCollectionKeyMethod, INodeSyncOptions, IGlobalNodeOptions } from '../..';
import { SourceBaseNW } from '../base/source-base-nw';

export class SourceObjectNW<K extends string, S extends Record<K, any>, D> extends SourceBaseNW<K, S, D> implements ISourceInternalNodeWrapper<K, S, D> {
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
    key: K | undefined;
    typeInfo: NodeTypeInfo;
    lastSourceNode: any;
    matchingNodeOptions: INodeSyncOptions<any, any, any> | undefined;
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

  public childElementCount(): number {
    return 0;
  }

  //------------------------------
  // ISourceInternalNodeWrapper
  //------------------------------

  //@ts-ignore
  public nodeKeys() {
    return (this._value && Object.keys(this._value)) || [];
  }

  public getItem(key: K) {
    return this._value && this._value[key];
  }
}
