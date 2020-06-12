import { IMakeCollectionKey, IRdoCollectionNodeWrapper, RdoNodeTypeInfo, ISourceNodeWrapper, isISourceCollectionNodeWrapper, SyncUtils, ISyncChildElement } from '..';
import { Logger } from '../infrastructure/logger';
import { isISourceInternalNodeWrapper } from '../types';

const logger = Logger.make('RdoMapINW');
export class RdoMapINW<S, D> implements IRdoCollectionNodeWrapper<D> {
  private _map: Map<string, D>;
  private _makeKey?: IMakeCollectionKey<D>;
  private _wrappedSourceNode: ISourceNodeWrapper;
  private _syncChildElement: ISyncChildElement<S, D>;

  constructor({ node, wrappedSourceNode, makeKey, syncChildElement }: { node: Map<string, D>; wrappedSourceNode: ISourceNodeWrapper; makeKey: IMakeCollectionKey<any>; syncChildElement: ISyncChildElement<S, D> }) {
    this._map = node;
    this._makeKey = makeKey;
    this._wrappedSourceNode = wrappedSourceNode;
    this._syncChildElement = syncChildElement;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get node() {
    return this._map;
  }

  public get typeInfo(): RdoNodeTypeInfo {
    return { kind: 'Collection', type: 'Map', builtInType: '[object Map]' };
  }

  public keys() {
    return this._map.keys();
  }

  public getItem(key: string) {
    return this._map.get(key);
  }

  public updateItem(value: D) {
    if (this._makeKey) {
      const key = this._makeKey(value);
      if (this._map.has(key)) {
        this._map.set(key, value);
        return true;
      } else return false;
    } else {
      throw new Error('make key from RDO element must be available for Map update operations');
    }
  }

  //------------------------------
  // IRdoInternalNodeWrapper
  //------------------------------

  public smartSync<S>({ lastSourceObject }: { lastSourceObject: any }): boolean {
    if (this._wrappedSourceNode.size() === 0 && this.size() > 0) {
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
  public size(): number {
    return this._map.size;
  }

  public get makeKey() {
    return this._makeKey;
  }

  public insertItem(value: D) {
    if (this._makeKey) {
      const key = this._makeKey(value);
      this._map.set(key, value);
    } else {
      throw new Error('make key from source element must be available for Map insert operations');
    }
  }

  public deleteItem(key: string): boolean {
    return this._map.delete(key);
  }

  public clearItems(): boolean {
    if (this.size() === 0) return false;
    this._map.clear();
    return true;
  }
}
