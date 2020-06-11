import { IMakeCollectionKey, IRdoCollectionNodeWrapper, RdoNodeTypeInfo, ISourceNodeWrapper } from '..';

export class RdoMapINW<D> implements IRdoCollectionNodeWrapper<D> {
  private _map: Map<string, D>;
  private _makeKey?: IMakeCollectionKey<D>;
  private _wrappedSourceNode: ISourceNodeWrapper;

  constructor({ node, wrappedSourceNode, makeKey }: { node: Map<string, D>; wrappedSourceNode: ISourceNodeWrapper; makeKey: IMakeCollectionKey<any> }) {
    this._map = node;
    this._makeKey = makeKey;
    this._wrappedSourceNode = wrappedSourceNode;
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
  // IRdoCollectionNodeWrapper
  //------------------------------
  public size(): number {
    return this._map.size;
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
}
