import { SourceNodeTypeInfo, ISourceNodeWrapper } from '../types';

export class SourcePrimitiveNW<S> implements ISourceNodeWrapper<S> {
  private _primitive: S | null | undefined;
  private _key: string | undefined;
  private _typeInfo: SourceNodeTypeInfo;
  private _sourceNodePath: string;
  private _lastSourceNode: S | undefined;

  constructor({ value, sourceNodePath, key, typeInfo, lastSourceNode }: { value: S | null | undefined; sourceNodePath: string; key: string | undefined; typeInfo: SourceNodeTypeInfo; lastSourceNode: any }) {
    this._primitive = value;
    this._typeInfo = typeInfo;
    this._key = key;
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

  public get key() {
    return this._key;
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
