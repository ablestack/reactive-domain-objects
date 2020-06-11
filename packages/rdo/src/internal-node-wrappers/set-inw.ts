import { CollectionUtils, IMakeRdoCollectionKey, IRdoCollectionNodeWrapper } from '..';

export class SetINW<D> implements IRdoCollectionNodeWrapper<D> {
  private _set: Set<D>;
  private _makeKey?: IMakeRdoCollectionKey<D>;

  constructor({ node, makeKey }: { node: Set<D>; makeKey?: IMakeRdoCollectionKey<D> }) {
    this._set = node;
    this._makeKey = makeKey;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
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
