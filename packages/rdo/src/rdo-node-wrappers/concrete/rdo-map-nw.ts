import { Logger } from '../../infrastructure/logger';
import { RdoCollectionNWBase } from '..';
import { RdoNodeTypeInfo, IRdoNodeWrapper, ISourceNodeWrapper, IMakeCollectionKey, IMakeRdo, ISyncChildNode, isISourceCollectionNodeWrapper } from '../..';
import { SyncUtils } from '../utils/sync.utils';

const logger = Logger.make('RdoMapNW');

export class RdoMapNW<S, D> extends RdoCollectionNWBase<S, D> {
  private _value: Map<string, D>;

  constructor({
    value,
    typeInfo,
    key,
    parent,
    wrappedSourceNode,
    makeItemKey,
    makeItem,
    syncChildNode,
  }: {
    value: Map<string, D>;
    typeInfo: RdoNodeTypeInfo;
    key: string | undefined;
    parent: IRdoNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S>;
    makeItemKey: IMakeCollectionKey<D>;
    makeItem: IMakeRdo<S, D> | undefined;
    syncChildNode: ISyncChildNode<S, D>;
  }) {
    super({ typeInfo, key, parent, wrappedSourceNode, makeItemKey, makeItem, syncChildNode });
    this._value = value;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get value() {
    return this._value;
  }

  public itemKeys() {
    return this._value.keys();
  }

  public getItem(key: string) {
    return this._value.get(key);
  }

  public updateItem(key: string, value: D) {
    if (this._value.has(key)) {
      this._value.set(key, value);
      return true;
    } else return false;
  }

  //------------------------------
  // IRdoInternalNodeWrapper
  //------------------------------

  public smartSync(): boolean {
    if (this.wrappedSourceNode.childElementCount() === 0 && this.childElementCount() > 0) {
      return this.clearItems();
    } else {
      // Validate
      if (!isISourceCollectionNodeWrapper(this.wrappedSourceNode)) throw new Error(`RDO collection nodes can only be synced with Source collection nodes (Path: '${this.wrappedSourceNode.sourceNodePath}'`);

      // Execute
      return SyncUtils.synchronizeCollection({ rdo: this, syncChildNode: this._syncChildNode });
    }
  }

  //------------------------------
  // IRdoCollectionNodeWrapper
  //------------------------------
  public childElementCount(): number {
    return this._value.size;
  }

  public insertItem(value: D) {
    if (this.makeItemKey) {
      const key = this.makeItemKey(value);
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
