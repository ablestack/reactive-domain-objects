import { Logger } from '../../infrastructure/logger';
import { IRdoNodeWrapper, RdoNodeTypeInfo, ISourceNodeWrapper } from '../..';

const logger = Logger.make('RdoMapNW');

export abstract class RdoNWBase<S, D> implements IRdoNodeWrapper<S, D> {
  private _typeInfo: RdoNodeTypeInfo;
  private _key: string | undefined;
  private _parent: IRdoNodeWrapper<S, D> | undefined;
  private _wrappedSourceNode: ISourceNodeWrapper<S>;

  constructor({ typeInfo, key, parent, wrappedSourceNode }: { typeInfo: RdoNodeTypeInfo; key: string | undefined; parent: IRdoNodeWrapper<S, D> | undefined; wrappedSourceNode: ISourceNodeWrapper<S> }) {
    this._typeInfo = typeInfo;
    this._key = key;
    this._parent = parent;
    this._wrappedSourceNode = wrappedSourceNode;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get key() {
    return this._key;
  }

  public get parent() {
    return this._parent;
  }

  public get typeInfo(): RdoNodeTypeInfo {
    return this._typeInfo;
  }

  public get wrappedSourceNode(): ISourceNodeWrapper<S> {
    return this._wrappedSourceNode;
  }

  public abstract get value();
  public abstract smartSync();
  public abstract childElementCount();
}
