import { ISourceInternalNodeWrapper, SourceNodeTypeInfo, IMakeCollectionKey, INodeSyncOptions, IGlobalNameOptions } from '../..';
import { SourceBaseNW } from '../base/source-base-nw';

export class SourceObjectNW<S extends Record<string, any>> extends SourceBaseNW<S> implements ISourceInternalNodeWrapper<S> {
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
    globalNodeOptions: IGlobalNameOptions | undefined;
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

  public itemKeys() {
    return (this._value && Object.keys(this._value)) || [];
  }

  public getItem(key: string) {
    return this._value && this._value[key];
  }
}
