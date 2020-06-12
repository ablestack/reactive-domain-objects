import { IMakeCollectionKey, IRdoCollectionNodeWrapper, ISyncableCollection, RdoNodeTypeInfo, ISourceNodeWrapper } from '..';
import { isIRdoCollectionNodeWrapper, isISourceCollectionNodeWrapper, ISyncChildElement, IRdoNodeWrapper } from '../types';
import { SyncUtils } from '../utilities';
import { Logger } from '../infrastructure/logger';

const logger = Logger.make('RdoSyncableCollectionINW');

export class RdoSyncableCollectionINW<S, D> implements IRdoCollectionNodeWrapper<D> {
  private _value: ISyncableCollection<D>;
  private _key: string | undefined;
  private _parent: IRdoNodeWrapper | undefined;
  private _wrappedSourceNode: ISourceNodeWrapper;
  private _syncChildElement: ISyncChildElement<S, D>;

  constructor({
    value,
    key,
    parent,
    wrappedSourceNode,
    syncChildElement,
  }: {
    value: ISyncableCollection<D>;
    key: string | undefined;
    parent: IRdoNodeWrapper | undefined;
    wrappedSourceNode: ISourceNodeWrapper;
    syncChildElement: ISyncChildElement<S, D>;
  }) {
    this._value = value;
    this._key = key;
    this._parent = parent;
    this._wrappedSourceNode = wrappedSourceNode;
    this._syncChildElement = syncChildElement;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get value() {
    return this._value;
  }

  public get key() {
    return this.key;
  }

  public get parent() {
    return this._parent;
  }

  public get typeInfo(): RdoNodeTypeInfo {
    return { kind: 'Collection', type: 'ISyncableCollection', builtInType: '[object Map]' };
  }

  public keys() {
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
    if (this._wrappedSourceNode.childElementCount() === 0 && this.childElementCount() > 0) {
      return this.clearItems();
    } else {
      if (!isISourceCollectionNodeWrapper(this._wrappedSourceNode)) throw new Error(`RDO collection nodes can only be synced with Source collection nodes (Path: '${this._wrappedSourceNode.sourceNodePath}'`);
      return SyncUtils.synchronizeCollection({ sourceCollection: this._wrappedSourceNode.values(), targetRdoCollectionNodeWrapper: this, tryStepIntoElementAndSync: this._syncChildElement });
    }
  }

  //------------------------------
  // IRdoCollectionNodeWrapper
  //------------------------------
  public childElementCount(): number {
    return this._value.size;
  }

  public get makeKey() {
    return this._value.makeKey;
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
