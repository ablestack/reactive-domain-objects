import { ISourceInternalNodeWrapper } from '..';
import { IMakeCollectionKey, SourceNodeTypeInfo } from '../types';

export class SourceObjectINW<S> implements ISourceInternalNodeWrapper<S> {
  private _object: Record<string, S>;
  private _typeInfo: SourceNodeTypeInfo;
  private _sourceNodePath: string;
  private _lastSourceNode: any;
  private _makeKey?: IMakeCollectionKey<S>;

  constructor({ node, sourceNodePath, typeInfo, lastSourceNode, makeKey }: { node: Record<string, S>; sourceNodePath: string; typeInfo: SourceNodeTypeInfo; lastSourceNode: any; makeKey: IMakeCollectionKey<S> }) {
    this._object = node;
    this._typeInfo = typeInfo;
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

  public get node() {
    return this._object;
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

  public keys() {
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
