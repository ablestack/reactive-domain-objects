import { CollectionUtils, IMakeCollectionKey, IRdoCollectionNodeWrapper, RdoNodeTypeInfo, ISourceNodeWrapper, isISourceCollectionNodeWrapper, SyncUtils, ISyncChildElement } from '..';
import { Logger } from '../infrastructure/logger';
import { config } from '../static.config';
import { RdoWrapperValidationUtils } from './rdo-wrapper-validation.utils';

const logger = Logger.make('RdoSetINW');

export class RdoSetINW<D> implements IRdoCollectionNodeWrapper<D> {
  private _set: Set<D>;
  private _makeKey?: IMakeCollectionKey<D>;
  private _wrappedSourceNode: ISourceNodeWrapper;
  private _syncChildElement: ISyncChildElement<S, D>;

  constructor({ node, wrappedSourceNode, makeKey, syncChildElement }: { node: Set<D>; wrappedSourceNode: ISourceNodeWrapper; makeKey: IMakeCollectionKey<any>; syncChildElement: ISyncChildElement<S, D> }) {
    this._set = node;
    this._makeKey = makeKey;
    this._wrappedSourceNode = wrappedSourceNode;
    this._syncChildElement = syncChildElement;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get node() {
    return this._set;
  }

  public get typeInfo(): RdoNodeTypeInfo {
    return { kind: 'Collection', type: 'Set', builtInType: '[object Set]' };
  }

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
  // IRdoInternalNodeWrapper
  //------------------------------

  public smartSync<S>({ lastSourceObject }: { lastSourceObject: any }): boolean {
    if (!isISourceCollectionNodeWrapper(wrappedSourceNode)) throw new Error('RdoMapINW can only sync with collection source types');

    if (wrappedSourceNode.size() === 0 && this.size() > 0) {
      return this.clearItems();
    } else {
      // Validation
      if (this.size() > 0 && !this.makeKey)
        throw new Error(`Could not find 'makeKey' (Path: '${this._wrappedSourceNode.sourceNodePath}', type: ${this.typeInfo.builtInType}). Please see instructions for how to configure`);
      RdoWrapperValidationUtils.nonKeyedCollectionSizeCheck({ collectionSize: this.size(), collectionType: this.typeInfo.builtInType });

      // Execute
      return SyncUtils.synchronizeCollection({ sourceCollection: wrappedSourceNode.values(), targetRdoCollectionNodeWrapper: this, tryStepIntoElementAndSync: syncChildElement });
    }
  }

  //------------------------------
  // IRdoCollectionNodeWrapper
  //------------------------------
  public size(): number {
    return this._set.size;
  }

  public get makeKey() {
    return this._makeKey;
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

  public clearItems(): boolean {
    if (this.size() === 0) return false;
    this._set.clear();
    return true;
  }
}
