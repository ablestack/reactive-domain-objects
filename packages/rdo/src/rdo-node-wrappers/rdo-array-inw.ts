import { CollectionUtils, IMakeCollectionKey, IRdoCollectionNodeWrapper, RdoNodeTypeInfo, ISourceNodeWrapper, isISourceCollectionNodeWrapper, SyncUtils, ISyncChildElement } from '..';
import { Logger } from '../infrastructure/logger';
import { RdoWrapperValidationUtils } from './rdo-wrapper-validation.utils';

const logger = Logger.make('RdoArrayINW');

export class RdoArrayINW<S, D> implements IRdoCollectionNodeWrapper<D> {
  private _array: Array<D>;
  private _makeKey?: IMakeCollectionKey<D>;
  private _wrappedSourceNode: ISourceNodeWrapper;
  private _syncChildElement: ISyncChildElement<S, D>;

  constructor({ node, wrappedSourceNode, makeKey, syncChildElement }: { node: Array<D>; wrappedSourceNode: ISourceNodeWrapper; makeKey: IMakeCollectionKey<any>; syncChildElement: ISyncChildElement<S, D> }) {
    this._array = node;
    this._makeKey = makeKey;
    this._wrappedSourceNode = wrappedSourceNode;
    this._syncChildElement = syncChildElement;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get node() {
    return this._array;
  }

  public get typeInfo(): RdoNodeTypeInfo {
    return { kind: 'Collection', type: 'Array', builtInType: '[object Array]' };
  }

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

  //------------------------------
  // IRdoInternalNodeWrapper
  //------------------------------

  public smartSync<S>({ lastSourceObject }: { lastSourceObject: any }): boolean {
    if (this._wrappedSourceNode.childElementCount() === 0 && this.childElementCount() > 0) {
      return this.clearItems();
    } else {
      // Validation
      if (this.childElementCount() > 0 && !this.makeKey) {
        throw new Error(`Could not find 'makeKey' (Path: '${this._wrappedSourceNode.sourceNodePath}', type: ${this.typeInfo.builtInType}). Please see instructions for how to configure`);
      }

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
    return this._array.length;
  }

  public get makeKey() {
    return this._makeKey;
  }

  public insertItem(value: D) {
    if (this._makeKey) {
      const key = this._makeKey(value);
      CollectionUtils.Array.insertItem({ collection: this._array, key, value });
    } else {
      throw new Error('make key from source element must be available for insert operations');
    }
  }

  public deleteItem(key: string): boolean {
    if (this._makeKey) {
      return CollectionUtils.Array.deleteItem({ collection: this._array, makeCollectionKey: this._makeKey, key });
    } else {
      throw new Error('make key from RDO element must be available for Array delete operations');
    }
  }

  public clearItems(): boolean {
    return CollectionUtils.Array.clear({ collection: this._array });
  }
}
