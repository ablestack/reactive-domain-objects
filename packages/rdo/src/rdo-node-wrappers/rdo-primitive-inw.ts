import { IRdoNodeWrapper, RdoNodeTypeInfo, ISourceNodeWrapper } from '../types';
import { Logger } from '../infrastructure/logger';

const logger = Logger.make('RdoPrimitiveINW');

export class RdoPrimitiveINW implements IRdoNodeWrapper {
  private _object: object;
  private _typeInfo: RdoNodeTypeInfo;
  private _wrappedSourceNode: ISourceNodeWrapper;

  constructor({ node, wrappedSourceNode, typeInfo }: { node: Record<string, any>; wrappedSourceNode: ISourceNodeWrapper; typeInfo: RdoNodeTypeInfo }) {
    this._object = node;
    this._typeInfo = typeInfo;
    this._wrappedSourceNode = wrappedSourceNode;
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

  childElementCount(): number {
    return 0;
  }
}
