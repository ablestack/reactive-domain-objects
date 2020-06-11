import { IRdoInternalNodeWrapper } from '..';
import { IMakeRdoCollectionKey } from '../types';

export class ObjectINW implements IRdoInternalNodeWrapper<any> {
  private _object: object;
  private _makeKey?: IMakeRdoCollectionKey<D>;

  constructor({ node, makeKey }: { node: Record<string, any>; makeKey: IMakeRdoCollectionKey<D> }) {
    this._object = node;
    this._makeKey = makeKey;
  }

  //------------------------------
  // IRdoNodeWrapper
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
