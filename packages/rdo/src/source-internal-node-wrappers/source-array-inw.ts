import { CollectionUtils, IMakeCollectionKey, ISourceInternalNodeWrapper, SourceNodeTypeInfo, ISourceCollectionNodeWrapper } from '..';

export class SourceArrayINW<S> implements ISourceCollectionNodeWrapper<S> {
  private _array: Array<S>;
  private _typeInfo: SourceNodeTypeInfo;
  private _sourceNodePath: string;
  private _lastSourceNode: any;
  private _makeKey?: IMakeCollectionKey<any>;

  constructor({ node, sourceNodePath, typeInfo, lastSourceNode, makeKey }: { node: Array<S>; sourceNodePath: string; typeInfo: SourceNodeTypeInfo; lastSourceNode: any; makeKey: IMakeCollectionKey<S> }) {
    this._array = node;
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

  public get value() {
    return this._array;
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
    if (this._makeKey) return CollectionUtils.Array.getKeys({ collection: this._array, makeCollectionKey: this._makeKey });
    else return [];
  }

  public getItem(key: string) {
    if (this._makeKey) return CollectionUtils.Array.getItem({ collection: this._array, makeCollectionKey: this._makeKey!, key });
    else return undefined;
  }

  public updateItem(value: any) {
    if (this._makeKey) return CollectionUtils.Array.updateItem({ collection: this._array, makeCollectionKey: this._makeKey!, value });
    else throw new Error('make key from RDO element must be available for Array update operations');
  }

  public getNode(): any {
    return this._array;
  }

  //------------------------------
  // ISourceCollectionNodeWrapper
  //------------------------------

  values(): Iterable<S> {
    return this._array;
  }
}
