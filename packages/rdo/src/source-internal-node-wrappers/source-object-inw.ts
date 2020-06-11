import { ISourceInternalNodeWrapper } from '..';
import { IMakeCollectionKey, SourceNodeTypeInfo } from '../types';

export class SourceObjectINW implements ISourceInternalNodeWrapper<any> {
  private _object: object;
  private _makeKey?: IMakeCollectionKey<any>;
  private _sourceNodePath: string;

  public get sourceNodePath(): string {
    return this._sourceNodePath;
  }

  constructor({ node, sourceNodePath, makeKey }: { node: Record<string, any>; sourceNodePath: string; makeKey: IMakeCollectionKey<any> }) {
    this._object = node;
    this._makeKey = makeKey;
    this._sourceNodePath = sourceNodePath;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get node() {
    return this._object;
  }

  public get typeInfo(): SourceNodeTypeInfo {
    return { kind: 'Object', builtInType: '[object Object]' };
  }

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
