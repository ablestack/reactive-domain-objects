import { ISourceInternalNodeWrapper, NodeTypeInfo, MakeCollectionKeyMethod, INodeSyncOptions, IGlobalNodeOptions } from '../..';
import { SourceBaseNW } from '../base/source-base-nw';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';

export class SourceObjectNW<K extends string, S extends Record<K, any>, D> extends SourceBaseNW<K, S, D> implements ISourceInternalNodeWrapper<K, S, D> {
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
    key: K | undefined;
    typeInfo: NodeTypeInfo;
    matchingNodeOptions: INodeSyncOptions<any, any, any> | undefined;
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
  // ISourceInternalNodeWrapper
  //------------------------------

  //@ts-ignore
  public nodeKeys(): K[] {
    return ((this._value && Object.keys(this._value)) || []) as K[];
  }

  public getItem(key: K) {
    return this._value && this._value[key];
  }
}
