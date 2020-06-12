import { SourceNodeTypeInfo, ISourceNodeWrapper } from '../types';

export class SourcePrimitiveINW implements ISourceNodeWrapper {
  private _primitive: object | null | undefined;
  private _typeInfo: SourceNodeTypeInfo;
  private _sourceNodePath: string;
  private _lastSourceNode: any;

  constructor({ node, sourceNodePath, typeInfo, lastSourceNode }: { node: object | null | undefined; sourceNodePath: string; typeInfo: SourceNodeTypeInfo; lastSourceNode: any }) {
    this._primitive = node;
    this._typeInfo = typeInfo;
    this._sourceNodePath = sourceNodePath;
    this._lastSourceNode = lastSourceNode;
  }

  //------------------------------
  // ISourceNodeWrapper
  //------------------------------

  public get typeInfo(): SourceNodeTypeInfo {
    return this._typeInfo;
  }

  public get value() {
    return this._primitive;
  }

  public get sourceNodePath(): string {
    return this._sourceNodePath;
  }

  public get lastSourceNode() {
    return this._lastSourceNode;
  }

  childElementCount(): number {
    return 0;
  }
}
