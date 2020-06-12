import { IMakeRdoCollectionKey, IRdoCollectionNodeWrapper, ISyncableCollection } from '..';

export class SyncableRDOCollectionNW<D> implements IRdoCollectionNodeWrapper<D> {
  private _isyncableCollection: ISyncableCollection<D>;

  constructor({ node }: { node: ISyncableCollection<D> }) {
    this._isyncableCollection = node;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public itemKeys() {
    return this._isyncableCollection.getKeys();
  }

  public getItem(key: string) {
    return this._isyncableCollection.getItem(key);
  }

  public updateItem(value: D) {
    return this._isyncableCollection.updateItem(value);
  }

  //------------------------------
  // IRdoCollectionNodeWrapper
  //------------------------------
  public childElementCount(): number {
    return this._isyncableCollection.size;
  }

  public insertItem(value: D) {
    this._isyncableCollection.insertItem(value);
  }

  public deleteItem(key: string): boolean {
    return this._isyncableCollection.deleteItem(key);
  }
}
