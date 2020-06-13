import { Logger } from '../../infrastructure/logger';
import { RdoCollectionNWBase, RdoWrapperValidationUtils } from '..';
import { RdoNodeTypeInfo, IRdoNodeWrapper, ISourceNodeWrapper, IMakeCollectionKey, IMakeRdo, ISyncChildNode, isISourceCollectionNodeWrapper } from '../..';
import { CollectionUtils } from '../utils/collection.utils';
import { SyncUtils } from '../utils/sync.utils';

const logger = Logger.make('RdoArrayNW');

export class RdoArrayNW<S, D> extends RdoCollectionNWBase<S, D> {
  private _value: Array<D>;

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
    value: Array<D>;
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
    if (this.makeItemKey) return CollectionUtils.Array.getKeys({ collection: this._value, makeItemKey: this.makeItemKey });
    else return [];
  }

  public getItem(key: string) {
    if (this.makeItemKey) return CollectionUtils.Array.getItem({ collection: this._value, makeItemKey: this.makeItemKey!, key });
    else return undefined;
  }

  public updateItem(value: any) {
    if (this.makeItemKey) return CollectionUtils.Array.updateItem({ collection: this._value, makeItemKey: this.makeItemKey!, value });
    else throw new Error('make key from RDO element must be available for Array update operations');
  }

  //------------------------------
  // IRdoInternalNodeWrapper
  //------------------------------

  public smartSync(): boolean {
    if (this.wrappedSourceNode.childElementCount() === 0 && this.childElementCount() > 0) {
      return this.clearItems();
    } else {
      // Validation
      if (this.childElementCount() > 0 && !this.makeItemKey) {
        throw new Error(`Could not find 'makeKey' (Path: '${this.wrappedSourceNode.sourceNodePath}', type: ${this.typeInfo.builtInType}). Please see instructions for how to configure`);
      }

      RdoWrapperValidationUtils.nonKeyedCollectionSizeCheck({ sourceNodePath: this.wrappedSourceNode.sourceNodePath, collectionSize: this.childElementCount(), collectionType: this.typeInfo.builtInType });

      if (!isISourceCollectionNodeWrapper(this.wrappedSourceNode)) throw new Error(`RDO collection nodes can only be synced with Source collection nodes (Path: '${this.wrappedSourceNode.sourceNodePath}'`);

      // Execute
      return SyncUtils.synchronizeCollection({ rdo: this, syncChildNode: this._syncChildNode });
    }
  }

  //------------------------------
  // IRdoCollectionNodeWrapper
  //------------------------------
  public childElementCount(): number {
    return this._value.length;
  }

  public insertItem(value: D) {
    if (this.makeItemKey) {
      const key = this.makeItemKey(value);
      CollectionUtils.Array.insertItem({ collection: this._value, key, value });
    } else {
      throw new Error('make key from source element must be available for insert operations');
    }
  }

  public deleteItem(key: string): boolean {
    if (this.makeItemKey) {
      return CollectionUtils.Array.deleteItem({ collection: this._value, makeItemKey: this.makeItemKey, key });
    } else {
      throw new Error('make key from RDO element must be available for Array delete operations');
    }
  }

  public clearItems(): boolean {
    return CollectionUtils.Array.clear({ collection: this._value });
  }
}
