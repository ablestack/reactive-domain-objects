import { CollectionUtils, IMakeCollectionKey, ISourceInternalNodeWrapper, SourceNodeTypeInfo, ISourceCollectionNodeWrapper } from '..';

export class SourceArrayINW<D> implements ISourceCollectionNodeWrapper<D> {
  private _array: Array<D>;
  private _makeKey?: IMakeCollectionKey<D>;
  private _sourceNodePath: string;

  public get sourceNodePath(): string {
    return this._sourceNodePath;
  }

  constructor({ node, sourceNodePath, makeKey }: { node: Array<D>; sourceNodePath: string; makeKey?: IMakeCollectionKey<D> }) {
    this._array = node;
    this._makeKey = makeKey;
    this._sourceNodePath = sourceNodePath;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get node() {
    return this._array;
  }

  public get typeInfo(): SourceNodeTypeInfo {
    return { kind: 'Collection', builtInType: '[object Array]' };
  }

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

  size(): number {
    return this._array.length;
  }

  values(): Iterable<D> {
    return this._array;
  }
}
