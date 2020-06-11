import { IMakeCollectionKey, IRdoCollectionNodeWrapper, ISyncableCollection, RdoNodeTypeInfo, ISourceNodeWrapper } from '..';
import { isIRdoCollectionNodeWrapper, isISourceCollectionNodeWrapper } from '../types';
import { SyncUtils } from '../utilities';

export class RdoSyncableCollectionINW<D> implements IRdoCollectionNodeWrapper<D> {
  private _isyncableCollection: ISyncableCollection<D>;
  private _wrappedSourceNode: ISourceNodeWrapper;

  constructor({ node, wrappedSourceNode }: { node: ISyncableCollection<D>; wrappedSourceNode: ISourceNodeWrapper }) {
    this._isyncableCollection = node;
    this._wrappedSourceNode = wrappedSourceNode;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get node() {
    return this._isyncableCollection;
  }

  public get typeInfo(): RdoNodeTypeInfo {
    return { kind: 'Collection', type: 'ISyncableCollection', builtInType: '[object Map]' };
  }

  public keys() {
    return this._isyncableCollection.getKeys();
  }

  public getItem(key: string) {
    return this._isyncableCollection.getItem(key);
  }

  public updateItem(value: D) {
    return this._isyncableCollection.updateItem(value);
  }

  //------------------------------
  // IRdoInternalNodeWrapper
  //------------------------------

  public smartSync({ wrappedSourceNode, lastSourceObject }: { wrappedSourceNode: ISourceNodeWrapper; lastSourceObject: any }): boolean {
    if (!isISourceCollectionNodeWrapper(wrappedSourceNode)) throw new Error('RdoSyncableCollectionINW can only sync with collection source types');

    if (wrappedSourceNode.size() === 0 && this.size() > 0) {
      return this.clearItems();
    } else {
      return SyncUtils.synchronizeCollection({ sourceCollection: wrappedSourceNode.values(), targetRdoCollectionNodeWrapper: this, tryStepIntoElementAndSync: todo });
    }
  }

  //------------------------------
  // IRdoCollectionNodeWrapper
  //------------------------------
  public size(): number {
    return this._isyncableCollection.size;
  }

  public get makeKey() {
    return this._isyncableCollection.makeKey;
  }

  public insertItem(value: D) {
    this._isyncableCollection.insertItem(value);
  }

  public deleteItem(key: string): boolean {
    return this._isyncableCollection.deleteItem(key);
  }

  public clearItems(): boolean {
    return this._isyncableCollection.clearItems();
  }
}
