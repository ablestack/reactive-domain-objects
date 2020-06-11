import { IRdoInternalNodeWrapper } from '..';
import { IMakeCollectionKey, RdoNodeTypeInfo } from '../types';

export class RdoObjectINW implements IRdoInternalNodeWrapper<any> {
  private _object: object;
  private _makeKey?: IMakeCollectionKey<any>;

  constructor({ node, makeKey }: { node: Record<string, any>; makeKey: IMakeCollectionKey<any> }) {
    this._object = node;
    this._makeKey = makeKey;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get node() {
    return this._object;
  }

  public get typeInfo(): RdoNodeTypeInfo {
    return { type: 'Object', builtInType: '[object Object]' };
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
