import { CollectionUtils, IMakeCollectionKey, IRdoCollectionNodeWrapper, RdoNodeTypeInfo, ISourceNodeWrapper, isISourceCollectionNodeWrapper, SyncUtils } from '..';

export class RdoSetINW<D> implements IRdoCollectionNodeWrapper<D> {
  private _set: Set<D>;
  private _makeKey?: IMakeCollectionKey<D>;
  private _wrappedSourceNode: ISourceNodeWrapper;

  constructor({ node, wrappedSourceNode, makeKey }: { node: Set<D>; wrappedSourceNode: ISourceNodeWrapper; makeKey: IMakeCollectionKey<any> }) {
    this._set = node;
    this._makeKey = makeKey;
    this._wrappedSourceNode = wrappedSourceNode;
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

  public smartSync({ wrappedSourceNode, lastSourceObject }: { wrappedSourceNode: ISourceNodeWrapper; lastSourceObject: any }): boolean {
    if (!isISourceCollectionNodeWrapper(wrappedSourceNode)) throw new Error('RdoMapINW can only sync with collection source types');

    if (wrappedSourceNode.size() === 0 && this.size() > 0) {
      this.clearItems();
    } else {
      if (this.size() > 0 && !this.makeKey)
        throw new Error(
          `Could not find '!makeRdoCollectionKey?.fromRdoElement' (Path: '${this.getSourceNodePath()}', type: ${rdoNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IRdoFactory on the contained type`,
        );
      if (wrappedSourceNode.size() > NON_MAP_COLLECTION_SIZE_WARNING_THREASHOLD)
        logger.warn(
          `Path: '${this.getSourceNodePath()}', collectionSize:${
            sourceCollection.lastIndexOf
          }, Target collection type: Set - It is recommended that the Map or Custom collections types are used in the RDOs for large collections. Set and Array collections will perform poorly with large collections`,
        );

      return SyncUtils.synchronizeCollection({ sourceCollection: wrappedSourceNode.values(), targetRdoCollectionNodeWrapper: this, tryStepIntoElementAndSync: todo });
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
