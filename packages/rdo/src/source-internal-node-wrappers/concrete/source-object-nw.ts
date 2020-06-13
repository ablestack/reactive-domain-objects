import { ISourceInternalNodeWrapper, SourceNodeTypeInfo, IMakeCollectionKey } from '../..';

export class SourceObjectNW<S extends Record<string, any>> implements ISourceInternalNodeWrapper<S> {
  private _object: S;
  private _typeInfo: SourceNodeTypeInfo;
  private _key: string | undefined;
  private _sourceNodePath: string;
  private _lastSourceNode: any;

  constructor({ value, sourceNodePath, key, typeInfo, lastSourceNode }: { value: S; sourceNodePath: string; key: string | undefined; typeInfo: SourceNodeTypeInfo; lastSourceNode: any }) {
    this._object = value;
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
    return this._object;
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

  //------------------------------
  // ISourceInternalNodeWrapper
  //------------------------------

  public itemKeys() {
    return Object.keys(this._object);
  }

  public getItem(key: string) {
    return this._object[key];
  }
}
