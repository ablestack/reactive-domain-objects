/* eslint-disable @typescript-eslint/interface-name-prefix */

//--------------------------------------------------------
// RDO COLLECTION - SYNC CUSTOMIZATION INTERFACES
//-------------------------------------------------------

export type MakeCollectionKeyMethod<T> = (item: T) => string | undefined;

export interface IMakeCollectionKey<T> {
  makeCollectionKey: (item: T) => string | undefined;
}

export function isIMakeCollectionKey(o: any): o is IMakeCollectionKey<any> {
  return o && o.makeCollectionKey;
}

export interface IMakeCollectionKeyFromSourceElement<T> {
  makeCollectionKeyFromSourceElement: IMakeCollectionKey<T>['makeCollectionKey'];
}

export function isIMakeCollectionKeyFromSourceElement(o: any): o is IMakeCollectionKeyFromSourceElement<any> {
  return o && o.makeCollectionKeyFromSourceElement;
}

export interface IMakeCollectionKeyFromRdoElement<T> {
  makeCollectionKeyFromRdoElement: IMakeCollectionKey<T>['makeCollectionKey'];
}

export function isIMakeCollectionKeyFromRdoElement(o: any): o is IMakeCollectionKeyFromRdoElement<any> {
  return o && o.makeCollectionKeyFromRdoElement;
}

export interface IMakeRdo<S, D> {
  makeRdo(sourceObject: S): D | undefined;
}

export function isIMakeRdo(o: any): o is IMakeRdo<any, any> {
  return o && o.makeRdo;
}

export interface ISyncableCollection<S, D> extends IMakeCollectionKeyFromSourceElement<S>, IMakeCollectionKeyFromRdoElement<D> {
  readonly size: number;
  elements(): Iterable<D>;
  getCollectionKeys: () => string[];
  getElement: (key: string) => D | null | undefined;
  insertElement: (key: string, value: D) => void;
  updateElement: (key: string, value: D) => boolean;
  deleteElement: (key: string) => boolean;
  clearElements: () => boolean;
}

export function IsISyncableCollection(o: any): o is ISyncableCollection<any, any> {
  return o && o.size && o.elements && o.getCollectionKeys && o.getElement && o.insertElement && o.updateElement && o.deleteElement && o.clearElements && isIMakeCollectionKeyFromSourceElement(o) && isIMakeCollectionKeyFromRdoElement(o);
}

export interface ISyncableRDOCollection<S, D> extends IMakeRdo<S, D>, ISyncableCollection<S, D> {}

export function IsISyncableRDOCollection(o: any): o is ISyncableRDOCollection<any, any> {
  return o && isIMakeRdo(o) && IsISyncableCollection(o);
}
