/* eslint-disable @typescript-eslint/interface-name-prefix */

import { IRdoNodeWrapper, IMakeRdo } from './internal-types';

//--------------------------------------------------------
// RDO COLLECTION - SYNC CUSTOMIZATION INTERFACES
//-------------------------------------------------------

export type MakeCollectionKeyMethod<K extends string | number, T> = (item: T) => K;

export interface IMakeCollectionKey<K extends string | number, T> {
  makeCollectionKey: (item: T) => K;
}

export function isIMakeCollectionKey(o: any): o is IMakeCollectionKey<any, any> {
  return o && o.makeCollectionKey;
}

export interface IMakeRdoElement<S, D> {
  makeRdoElement(sourceObject: S): D | undefined;
}

export function isIMakeRdoElement(o: any): o is IMakeRdoElement<any, any> {
  return o && o.makeRdoElement;
}

export interface ISyncableCollection<K extends string | number, S, D> extends IMakeCollectionKey<K, S> {
  // readonly size: number;
  // elements(): Iterable<D>;
  // getCollectionKeys: () => K[];
  // getElement: (key: K) => D | null | undefined;
  // insertElement: (key: K, value: D) => void;
  // updateElement: (key: K, value: D) => boolean;
  // deleteElement: (key: K) => D | undefined;
  // clearElements: () => boolean;
}

export function IsISyncableCollection(o: any): o is ISyncableCollection<any, any, any> {
  return o && o.size && o.elements && o.getCollectionKeys && o.getElement && o.insertElement && o.updateElement && o.deleteElement && o.clearElements && isIMakeCollectionKey(o);
}

export interface ISyncableRDOCollection<K extends string | number, S, D> extends IMakeRdo<K, S, D>, ISyncableCollection<K, S, D> {}

export function IsISyncableRDOCollection(o: any): o is ISyncableRDOCollection<any, any, any> {
  return o && isIMakeRdoElement(o) && IsISyncableCollection(o);
}
