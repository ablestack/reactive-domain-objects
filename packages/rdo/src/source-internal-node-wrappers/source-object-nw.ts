import { ISourceInternalNodeWrapper } from '..';
import { IMakeCollectionKey, SourceNodeTypeInfo } from '../types';

export class SourceObjectNW implements ISourceInternalNodeWrapper<Record<string, any>> {
  private _object: Record<string, any>;
  private _typeInfo: SourceNodeTypeInfo;
  private _key: string | undefined;
  private _sourceNodePath: string;
  private _lastSourceNode: any;
  private _makeKey?: IMakeCollectionKey<Record<string, any>>;

  constructor({
    value,
    sourceNodePath,
    key,
    typeInfo,
    lastSourceNode,
    makeKey,
  }: {
    value: Record<string, any>;
    sourceNodePath: string;
    key: string | undefined;
    typeInfo: SourceNodeTypeInfo;
    lastSourceNode: any;
    makeKey: IMakeCollectionKey<Record<string, any>>;
  }) {
    this._object = value;
    this._typeInfo = typeInfo;
    this._key = key;
    this._sourceNodePath = sourceNodePath;
    this._lastSourceNode = lastSourceNode;
    this._makeKey = makeKey;
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

  public updateItem(value: any) {
    if (this._makeKey) {
      const key = this._makeKey(value);
      if (key in this._object) {
        this._object[key] = value;
        return true;
      } else return false;
    } else {
      throw new Error('make key from RDO element must be available for Object update operations');
    }
  }
}
