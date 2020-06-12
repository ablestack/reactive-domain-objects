import { IMakeCollectionKey, IRdoCollectionNodeWrapper, RdoNodeTypeInfo, ISourceNodeWrapper, isISourceCollectionNodeWrapper, SyncUtils, ISyncChildElement } from '..';
import { Logger } from '../infrastructure/logger';
import { isISourceInternalNodeWrapper, IRdoNodeWrapper } from '../types';

const logger = Logger.make('RdoMapINW');
export class RdoMapINW<S, D> implements IRdoCollectionNodeWrapper<D> {
  private _value: Map<string, D>;
  private _key: string | undefined;
  private _parent: IRdoNodeWrapper | undefined;
  private _makeCollectionKey?: IMakeCollectionKey<D>;
  private _wrappedSourceNode: ISourceNodeWrapper;
  private _syncChildElement: ISyncChildElement<S, D>;

  constructor({
    value,
    key,
    parent,
    wrappedSourceNode,
    makeKey,
    syncChildElement,
  }: {
    value: Map<string, D>;
    key: string | undefined;
    parent: IRdoNodeWrapper | undefined;
    wrappedSourceNode: ISourceNodeWrapper;
    makeKey: IMakeCollectionKey<any>;
    syncChildElement: ISyncChildElement<S, D>;
  }) {
    this._value = value;
    this._key = key;
    this._parent = parent;
    this._makeCollectionKey = makeKey;
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
    return { kind: 'Collection', type: 'Map', builtInType: '[object Map]' };
  }

  public keys() {
    return this._value.keys();
  }

  public getItem(key: string) {
    return this._value.get(key);
  }

  public updateItem(key: string, value: D) {
    if (this._makeCollectionKey) {
      if (this._value.has(key)) {
        this._value.set(key, value);
        return true;
      } else return false;
    } else {
      throw new Error('make key from RDO element must be available for Map update operations');
    }
  }

  //------------------------------
  // IRdoInternalNodeWrapper
  //------------------------------

  public smartSync(): boolean {
    if (this._wrappedSourceNode.childElementCount() === 0 && this.childElementCount() > 0) {
      return this.clearItems();
    } else {
      // Validate
      if (!isISourceCollectionNodeWrapper(this._wrappedSourceNode)) throw new Error(`RDO collection nodes can only be synced with Source collection nodes (Path: '${this._wrappedSourceNode.sourceNodePath}'`);

      // Execute
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
    return this._makeCollectionKey;
  }

  public insertItem(value: D) {
    if (this._makeCollectionKey) {
      const key = this._makeCollectionKey(value);
      this._value.set(key, value);
    } else {
      throw new Error('make key from source element must be available for Map insert operations');
    }
  }

  public deleteItem(key: string): boolean {
    return this._value.delete(key);
  }

  public clearItems(): boolean {
    if (this.childElementCount() === 0) return false;
    this._value.clear();
    return true;
  }
}
