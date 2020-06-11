import { SourceNodeTypeInfo, ISourceNodeWrapper } from '../types';

export class SourcePrimitiveINW implements ISourceNodeWrapper {
  private _object: object;
  private _typeInfo: SourceNodeTypeInfo;
  private _sourceNodePath: string;

  public get sourceNodePath(): string {
    return this._sourceNodePath;
  }

  constructor({ node, sourceNodePath, typeInfo }: { node: Record<string, any>; sourceNodePath: string; typeInfo: SourceNodeTypeInfo }) {
    this._object = node;
    this._typeInfo = typeInfo;
    this._sourceNodePath = sourceNodePath;
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
