import { IMakeCollectionKey, IRdoCollectionNodeWrapper, ISyncableCollection, RdoNodeTypeInfo, ISourceNodeWrapper } from '..';
import { isIRdoCollectionNodeWrapper, isISourceCollectionNodeWrapper, ISyncChildElement, IRdoNodeWrapper, ISyncableRDOCollection, IMakeRdo } from '../types';
import { SyncUtils } from '../utilities';
import { Logger } from '../infrastructure/logger';
import { RdoCollectionNWBase } from '.';

const logger = Logger.make('RdoSyncableCollectionNW');

export class RdoSyncableCollectionNW<S, D> extends RdoCollectionNWBase<S, D> {
  private _value: ISyncableRDOCollection<S, D>;

  constructor({
    value,
    typeInfo,
    key,
    parent,
    wrappedSourceNode,
    makeItemKey,
    makeItem,
    syncChildElement,
  }: {
    value: ISyncableRDOCollection<S, D>;
    typeInfo: RdoNodeTypeInfo;
    key: string | undefined;
    parent: IRdoNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S>;
    makeItemKey: IMakeCollectionKey<D>;
    makeItem: IMakeRdo<S, D> | undefined;
    syncChildElement: ISyncChildElement<S, D>;
  }) {
    super({ typeInfo, key, parent, wrappedSourceNode, makeItemKey, makeItem, syncChildElement });
    this._value = value;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get value() {
    return this._value;
  }

  public itemKeys() {
    return this._value.getKeys();
  }

  public getItem(key: string) {
    return this._value.getItem(key);
  }

  public updateItem(key: string, value: D) {
    return this._value.updateItem(key, value);
  }

  //------------------------------
  // IRdoInternalNodeWrapper
  //------------------------------

  public smartSync(): boolean {
    if (this.wrappedSourceNode.childElementCount() === 0 && this.childElementCount() > 0) {
      return this.clearItems();
    } else {
      if (!isISourceCollectionNodeWrapper(this.wrappedSourceNode)) throw new Error(`RDO collection nodes can only be synced with Source collection nodes (Path: '${this.wrappedSourceNode.sourceNodePath}'`);
      return SyncUtils.synchronizeCollection({ rdo: this, syncChildElement: this._syncChildElement });
    }
  }

  //------------------------------
  // IRdoCollectionNodeWrapper
  //------------------------------
  public childElementCount(): number {
    return this._value.size;
  }

  public insertItem(value: D) {
    this._value.insertItem(value);
  }

  public deleteItem(key: string): boolean {
    return this._value.deleteItem(key);
  }

  public clearItems(): boolean {
    return this._value.clearItems();
  }
}
