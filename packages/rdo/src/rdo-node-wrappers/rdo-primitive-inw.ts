import { IRdoNodeWrapper, RdoNodeTypeInfo } from '../types';

export class RdoPrimitiveINW implements IRdoNodeWrapper {
  private _object: object;
  private _typeInfo: RdoNodeTypeInfo;

  constructor({ node, typeInfo }: { node: Record<string, any>; typeInfo: RdoNodeTypeInfo }) {
    this._object = node;
    this._typeInfo = typeInfo;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get node() {
    return this._object;
  }

  public get typeInfo(): RdoNodeTypeInfo {
    return this._typeInfo;
  }
}
