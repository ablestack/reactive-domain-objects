/* eslint-disable @typescript-eslint/interface-name-prefix */

//--------------------------------------------------------
// RDO COLLECTION - SYNC CUSTOMIZATION INTERFACES
//-------------------------------------------------------

export interface IMakeCollectionKeyMethod<T> {
  (item: T): string | undefined;
}
export interface IRdoCollectionKeyFactory<S, D> {
  makeKeyFromSourceElement: IMakeCollectionKeyMethod<S>;
  makeKeyFromRdoElement: IMakeCollectionKeyMethod<D>;
}

export function isIRdoCollectionKeyFactory(o: any): o is IRdoCollectionKeyFactory<any, any> {
  return o && o.makeKeyFromSourceElement && o.makeKeyFromRdoElement;
}

export interface IMakeRdo<S, D> {
  makeRdo(sourceObject: S): D | undefined;
}

export function isIMakeRdo(o: any): o is IMakeRdo<any, any> {
  return o && o.makeRdo;
}

export interface ISyncableCollection<T> extends IMakeCollectionKeyMethod<T>, Iterable<T> {
  readonly size: number;
  getKeys: () => string[];
  getItem: (key: string) => T | null | undefined;
  insertItem: (value: T) => void;
  updateItem: (key: string, value: T) => boolean;
  deleteItem: (key: string) => boolean;
  clearItems: () => boolean;
}

export function IsISyncableCollection(o: any): o is ISyncableCollection<any> {
  return (
    o &&
    o.getKeys &&
    typeof o.getKeys === 'function' &&
    o.tryGetItemFromTargetCollection &&
    typeof o.tryGetItemFromTargetCollection === 'function' &&
    o.insertItemToTargetCollection &&
    typeof o.insertItemToTargetCollection === 'function' &&
    o.tryDeleteItemFromTargetCollection &&
    typeof o.tryDeleteItemFromTargetCollection === 'function' &&
    o.clear &&
    typeof o.clear === 'function'
  );
}

export interface ISyncableRDOCollection<S, D> extends IMakeRdo<S, D>, ISyncableCollection<D> {}

export function IsISyncableRDOCollection(o: any): o is ISyncableRDOCollection<any, any> {
  return o && isIMakeRdo(o) && IsISyncableCollection(o);
}
