import { SourceNodeTypeInfo, ISourceNodeWrapper } from '../types';

export class SourcePrimitiveINW implements ISourceNodeWrapper {
  private _object: object;
  private _typeInfo: SourceNodeTypeInfo;

  constructor({ node, typeInfo }: { node: Record<string, any>; typeInfo: SourceNodeTypeInfo }) {
    this._object = node;
    this._typeInfo = typeInfo;
  }

  //------------------------------
  // ISourceNodeWrapper
  //------------------------------
  public get node() {
    return this._object;
  }

  public get typeInfo(): SourceNodeTypeInfo {
    return this._typeInfo;
  }
}
