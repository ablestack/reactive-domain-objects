import { CollectionUtils, IMakeCollectionKey, ISourceInternalNodeWrapper } from '..';

export class SourceArrayINW<D> implements ISourceInternalNodeWrapper<D> {
  private _array: Array<D>;
  private _makeKey?: IMakeCollectionKey<D>;

  constructor({ node, makeKey }: { node: Array<D>; makeKey?: IMakeCollectionKey<D> }) {
    this._array = node;
    this._makeKey = makeKey;
  }

  //------------------------------
  // IRdoNodeWrapper
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
}
