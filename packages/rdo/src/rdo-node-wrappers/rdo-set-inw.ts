import { CollectionUtils, IMakeCollectionKey, IRdoCollectionNodeWrapper, RdoNodeTypeInfo, ISourceNodeWrapper } from '..';

export class RdoSetINW<D> implements IRdoCollectionNodeWrapper<D> {
  private _set: Set<D>;
  private _makeKey?: IMakeCollectionKey<D>;
  private _wrappedSourceNode: ISourceNodeWrapper;

  constructor({ node, wrappedSourceNode, makeKey }: { node: Set<D>; wrappedSourceNode: ISourceNodeWrapper; makeKey: IMakeCollectionKey<any> }) {
    this._set = node;
    this._makeKey = makeKey;
    this._wrappedSourceNode = wrappedSourceNode;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get node() {
    return this._set;
  }

  public get typeInfo(): RdoNodeTypeInfo {
    return { kind: 'Collection', type: 'Set', builtInType: '[object Set]' };
  }

  public keys() {
    if (this._makeKey) return CollectionUtils.Set.getKeys({ collection: this._set, makeCollectionKey: this._makeKey });
    else return [];
  }

  public getItem(key: string) {
    if (this._makeKey) return CollectionUtils.Set.getItem({ collection: this._set, makeCollectionKey: this._makeKey!, key });
    else return undefined;
  }

  public updateItem(value: any) {
    if (this._makeKey) return CollectionUtils.Set.updateItem({ collection: this._set, makeCollectionKey: this._makeKey!, value });
    else throw new Error('make key from RDO element must be available for Array update operations');
  }

  //------------------------------
  // IRdoCollectionNodeWrapper
  //------------------------------
  public size(): number {
    return this._set.size;
  }

  public insertItem(value: D) {
    if (this._makeKey) {
      const key = this._makeKey(value);
      CollectionUtils.Set.insertItem({ collection: this._set, key, value });
    } else {
      throw new Error('make key from source element must be available for insert operations');
    }
  }

  public deleteItem(key: string): boolean {
    if (this._makeKey) {
      return CollectionUtils.Set.deleteItem({ collection: this._set, makeCollectionKey: this._makeKey, key });
    } else {
      throw new Error('make key from RDO element must be available for Array delete operations');
    }
  }
}
