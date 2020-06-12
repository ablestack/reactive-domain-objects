import { CollectionUtils, IMakeCollectionKey, ISourceInternalNodeWrapper, SourceNodeTypeInfo, ISourceCollectionNodeWrapper } from '..';

export class SourceArrayNW<S extends Array<S>> implements ISourceCollectionNodeWrapper<S> {
  private _array: S;
  private _typeInfo: SourceNodeTypeInfo;
  private _key: string | undefined;
  private _sourceNodePath: string;
  private _lastSourceNode: any;
  private _makeItemKey?: IMakeCollectionKey<any>;

  constructor({
    node,
    sourceNodePath,
    key,
    typeInfo,
    lastSourceNode,
    makeItemKey,
  }: {
    node: S;
    sourceNodePath: string;
    key: string | undefined;
    typeInfo: SourceNodeTypeInfo;
    lastSourceNode: any;
    makeItemKey: IMakeCollectionKey<S>;
  }) {
    this._array = node;
    this._typeInfo = typeInfo;
    this._key = key;
    this._sourceNodePath = sourceNodePath;
    this._lastSourceNode = lastSourceNode;
    this._makeItemKey = makeItemKey;
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
    if (this._makeItemKey) return CollectionUtils.Array.getKeys({ collection: this._array, makeItemKey: this._makeItemKey });
    else return [];
  }

  public getItem(key: string) {
    if (this._makeItemKey) return CollectionUtils.Array.getItem({ collection: this._array, makeItemKey: this._makeItemKey!, key });
    else return undefined;
  }

  public updateItem(value: any) {
    if (this._makeItemKey) return CollectionUtils.Array.updateItem({ collection: this._array, makeItemKey: this._makeItemKey!, value });
    else throw new Error('make key from RDO element must be available for Array update operations');
  }

  public getNode(): any {
    return this._array;
  }

  //------------------------------
  // ISourceCollectionNodeWrapper
  //------------------------------

  public elements(): Iterable<S> {
    return this._array;
  }

  public get makeItemKey(): IMakeCollectionKey<S> | undefined {
    return this._makeItemKey;
  }
}
