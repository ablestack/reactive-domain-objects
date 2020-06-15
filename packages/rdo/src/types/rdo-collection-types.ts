/* eslint-disable @typescript-eslint/interface-name-prefix */

//--------------------------------------------------------
// RDO COLLECTION - SYNC CUSTOMIZATION INTERFACES
//-------------------------------------------------------

export interface IMakeCollectionKeyMethod<T> {
  (item: T): string | undefined;
}
export interface ICollectionKeyFactory<T> {
  makeKey: IMakeCollectionKeyMethod<T>;
}

export function isICollectionKeyFactory(o: any): o is ICollectionKeyFactory<any> {
  return o && o.makeKey;
}

export interface IMakeRdo<S, D> {
  makeRdo(sourceObject: S): D | undefined;
}

export function isIMakeRdo(o: any): o is IMakeRdo<any, any> {
  return o && o.makeRdo;
}

export interface ISyncableCollection<T> extends IMakeCollectionKeyMethod<T>, Iterable<T> {
  readonly size: number;
  getCollectionKeys: () => string[];
  getElement: (key: string) => T | null | undefined;
  insertElement: (value: T) => void;
  updateElement: (key: string, value: T) => boolean;
  deleteElement: (key: string) => boolean;
  clearElements: () => boolean;
}

export function IsISyncableCollection(o: any): o is ISyncableCollection<any> {
  return (
    o &&
    o.getCollectionKeys &&
    typeof o.getCollectionKeys === 'function' &&
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
