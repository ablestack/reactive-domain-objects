import { CollectionUtils, IMakeCollectionKey, IRdoCollectionNodeWrapper, RdoNodeTypeInfo, ISourceNodeWrapper, isISourceCollectionNodeWrapper, SyncUtils, ISyncChildElement, IRdoNodeWrapper } from '..';
import { Logger } from '../infrastructure/logger';
import { config } from '../static.config';
import { RdoWrapperValidationUtils } from './rdo-wrapper-validation.utils';

const logger = Logger.make('RdoSetINW');

export class RdoSetINW<S, D> implements IRdoCollectionNodeWrapper<D> {
  private _value: Set<D>;
  private _key: string | undefined;
  private _parent: IRdoNodeWrapper | undefined;
  private _makeKey?: IMakeCollectionKey<D>;
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
    value: Set<D>;
    key: string | undefined;
    parent: IRdoNodeWrapper | undefined;
    wrappedSourceNode: ISourceNodeWrapper;
    makeKey: IMakeCollectionKey<any>;
    syncChildElement: ISyncChildElement<S, D>;
  }) {
    this._value = value;
    this._key = key;
    this._parent = parent;
    this._makeKey = makeKey;
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
    return { kind: 'Collection', type: 'Set', builtInType: '[object Set]' };
  }

  public keys() {
    if (this._makeKey) return CollectionUtils.Set.getKeys({ collection: this._value, makeCollectionKey: this._makeKey });
    else return [];
  }

  public getItem(key: string) {
    if (this._makeKey) return CollectionUtils.Set.getItem({ collection: this._value, makeCollectionKey: this._makeKey!, key });
    else return undefined;
  }

  public updateItem(value: any) {
    if (this._makeKey) return CollectionUtils.Set.updateItem({ collection: this._value, makeCollectionKey: this._makeKey!, value });
    else throw new Error('make key from RDO element must be available for Array update operations');
  }

  //------------------------------
  // IRdoInternalNodeWrapper
  //------------------------------

  public smartSync(): boolean {
    if (this._wrappedSourceNode.childElementCount() === 0 && this.childElementCount() > 0) {
      return this.clearItems();
    } else {
      // Validation
      if (this.childElementCount() > 0 && !this.makeKey)
        throw new Error(`Could not find 'makeKey' (Path: '${this._wrappedSourceNode.sourceNodePath}', type: ${this.typeInfo.builtInType}). Please see instructions for how to configure`);
      RdoWrapperValidationUtils.nonKeyedCollectionSizeCheck({ sourceNodePath: this._wrappedSourceNode.sourceNodePath, collectionSize: this.childElementCount(), collectionType: this.typeInfo.builtInType });

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
    return this._makeKey;
  }

  public insertItem(value: D) {
    if (this._makeKey) {
      const key = this._makeKey(value);
      CollectionUtils.Set.insertItem({ collection: this._value, key, value });
    } else {
      throw new Error('make key from source element must be available for insert operations');
    }
  }

  public deleteItem(key: string): boolean {
    if (this._makeKey) {
      return CollectionUtils.Set.deleteItem({ collection: this._value, makeCollectionKey: this._makeKey, key });
    } else {
      throw new Error('make key from RDO element must be available for Array delete operations');
    }
  }

  public clearItems(): boolean {
    if (this.childElementCount() === 0) return false;
    this._value.clear();
    return true;
  }
}
