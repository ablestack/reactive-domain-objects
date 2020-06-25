/* eslint-disable @typescript-eslint/interface-name-prefix */

import { IRdoNodeWrapper, IMakeRdo, CollectionNodePatchOperation } from './internal-types';

//--------------------------------------------------------
// RDO COLLECTION - SYNC CUSTOMIZATION INTERFACES
//-------------------------------------------------------

export type MakeCollectionKeyMethod<K extends string | number, T> = (item: T) => K;

export interface IMakeCollectionKey<K extends string | number, T> {
  makeCollectionKey: (item: T, index: number) => K;
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
  readonly size: number;
  elements(): Iterable<D>;
  patchAdd(patchOp: Omit<CollectionNodePatchOperation<K, D>, 'op'>);
  patchDelete(patchOp: Omit<CollectionNodePatchOperation<K, D>, 'op'>);
}

export function IsISyncableCollection(o: any): o is ISyncableCollection<any, any, any> {
  return o && o.size !== undefined && o.elements && o.patchAdd && o.patchDelete && isIMakeCollectionKey(o);
}

export interface ISyncableRDOCollection<K extends string | number, S, D> extends IMakeRdo<K, S, D>, ISyncableCollection<K, S, D> {}

export function IsISyncableRDOCollection(o: any): o is ISyncableRDOCollection<any, any, any> {
  return o && isIMakeRdoElement(o) && IsISyncableCollection(o);
}
