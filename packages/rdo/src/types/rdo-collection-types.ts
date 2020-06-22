/* eslint-disable @typescript-eslint/interface-name-prefix */

import { IRdoNodeWrapper, IMakeRdo } from './internal-types';

//--------------------------------------------------------
// RDO COLLECTION - SYNC CUSTOMIZATION INTERFACES
//-------------------------------------------------------

export type MakeCollectionKeyMethod<K extends string | number, T> = (item: T) => K | undefined;

export interface IMakeCollectionKey<K extends string | number, T> {
  makeCollectionKey: (item: T) => K | undefined;
}

export function isIMakeCollectionKey(o: any): o is IMakeCollectionKey<any, any> {
  return o && o.makeCollectionKey;
}

export interface IMakeCollectionKeyFromSourceElement<K extends string | number, T> {
  makeCollectionKeyFromSourceElement: IMakeCollectionKey<K, T>['makeCollectionKey'];
}

export function isIMakeCollectionKeyFromSourceElement(o: any): o is IMakeCollectionKeyFromSourceElement<any, any> {
  return o && o.makeCollectionKeyFromSourceElement;
}

export interface IMakeCollectionKeyFromRdoElement<K extends string | number, T> {
  makeCollectionKeyFromRdoElement: IMakeCollectionKey<K, T>['makeCollectionKey'];
}

export function isIMakeCollectionKeyFromRdoElement(o: any): o is IMakeCollectionKeyFromRdoElement<any, any> {
  return o && o.makeCollectionKeyFromRdoElement;
}

export interface IMakeRdoElement<S, D> {
  makeRdoElement(sourceObject: S): D | undefined;
}

export function isIMakeRdoElement(o: any): o is IMakeRdoElement<any, any> {
  return o && o.makeRdoElement;
}

export interface ISyncableCollection<K extends string | number, S, D> extends IMakeCollectionKeyFromSourceElement<K, S>, IMakeCollectionKeyFromRdoElement<K, D> {
  readonly size: number;
  elements(): Iterable<D>;
  getCollectionKeys: () => K[];
  getElement: (key: K) => D | null | undefined;
  insertElement: (key: K, value: D) => void;
  updateElement: (key: K, value: D) => boolean;
  deleteElement: (key: K) => D | undefined;
  clearElements: () => boolean;
}

export function IsISyncableCollection(o: any): o is ISyncableCollection<any, any, any> {
  return o && o.size && o.elements && o.getCollectionKeys && o.getElement && o.insertElement && o.updateElement && o.deleteElement && o.clearElements && isIMakeCollectionKeyFromSourceElement(o) && isIMakeCollectionKeyFromRdoElement(o);
}

export interface ISyncableRDOCollection<K extends string | number, S, D> extends IMakeRdo<K, S, D>, ISyncableCollection<K, S, D> {}

export function IsISyncableRDOCollection(o: any): o is ISyncableRDOCollection<any, any, any> {
  return o && isIMakeRdoElement(o) && IsISyncableCollection(o);
}
