import { CollectionUtils, IMakeCollectionKey, IRdoCollectionNodeWrapper, RdoNodeTypeInfo, ISourceNodeWrapper } from '..';

export class RdoArrayINW<D> implements IRdoCollectionNodeWrapper<D> {
  private _array: Array<D>;
  private _makeKey?: IMakeCollectionKey<D>;
  private _wrappedSourceNode: ISourceNodeWrapper;

  constructor({ node, wrappedSourceNode, makeKey }: { node: Array<D>; wrappedSourceNode: ISourceNodeWrapper; makeKey: IMakeCollectionKey<any> }) {
    this._array = node;
    this._makeKey = makeKey;
    this._wrappedSourceNode = wrappedSourceNode;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get node() {
    return this._array;
  }

  public get typeInfo(): RdoNodeTypeInfo {
    return { kind: 'Collection', type: 'Array', builtInType: '[object Array]' };
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

  //------------------------------
  // IRdoCollectionNodeWrapper
  //------------------------------
  public size(): number {
    return this._array.length;
  }

  public insertItem(value: D) {
    if (this._makeKey) {
      const key = this._makeKey(value);
      CollectionUtils.Array.insertItem({ collection: this._array, key, value });
    } else {
      throw new Error('make key from source element must be available for insert operations');
    }
  }

  public deleteItem(key: string): boolean {
    if (this._makeKey) {
      return CollectionUtils.Array.deleteItem({ collection: this._array, makeCollectionKey: this._makeKey, key });
    } else {
      throw new Error('make key from RDO element must be available for Array delete operations');
    }
  }
}
