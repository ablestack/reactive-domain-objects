/* eslint-disable @typescript-eslint/interface-name-prefix */

import { IMakeRdo, IRdoInternalNodeWrapper, isIRdoInternalNodeWrapper } from './internal-types';

//--------------------------------------------------------
// RDO COLLECTION - SYNC CUSTOMIZATION INTERFACES
//-------------------------------------------------------

export type MakeCollectionKeyMethod<T> = (item: T) => string | number;

export interface ITryMakeCollectionKey<T> {
  tryMakeCollectionKey: (item: T, index: number) => string | number | undefined;
}

export function isITryMakeCollectionKey(o: any): o is IMakeCollectionKey<any> {
  return o && o.tryMakeCollectionKey;
}
export interface IMakeCollectionKey<T> {
  makeCollectionKey: (item: T, index: number) => string | number;
}

export function isIMakeCollectionKey(o: any): o is IMakeCollectionKey<any> {
  return o && o.makeCollectionKey;
}

export interface IMakeRdoElement<S, D> {
  makeRdoElement(sourceObject: S): D | undefined;
}

export function isIMakeRdoElement(o: any): o is IMakeRdoElement<any, any> {
  return o && o.makeRdoElement;
}

export interface IRdoCollectionNodeWrapper<S, D> extends IRdoInternalNodeWrapper<S, D> {
  elements(): Iterable<D | undefined>;
}

export function isIRdoCollectionNodeWrapper(o: any): o is IRdoCollectionNodeWrapper<any, any> {
  return o && o.elements && isIRdoInternalNodeWrapper(o) && isIMakeCollectionKey(o);
}

export interface IRdoKeyBasedCollectionNodeWrapper<S, D> extends IRdoInternalNodeWrapper<S, D> {
  onAdd: NodeAddHandler<S>;
  onReplace: NodeReplaceHandler<S>;
  onDelete: NodeDeleteHandler<S>;
}

export function isIRdoKeyBasedCollectionNodeWrapper(o: any): o is IRdoCollectionNodeWrapper<any, any> {
  return o && o.onAdd && o.onReplace && o.onDelete && isIRdoCollectionNodeWrapper(o);
}

export interface ISyncableKeyBasedCollection<T> {
  readonly size: number;
  elements(): Iterable<T>;
  add({ index, key, newItem }: { index?: number; key: string | number; newItem: T });
  replace({ index, key, origItem, newItem }: { index?: number; key: string | number; origItem: any; newItem: T });
  delete({ index, key, origItem }: { index?: number; key: string | number; origItem: T });
}

export function IsISyncableCollection<T>(o: any): o is ISyncableKeyBasedCollection<T> {
  return o && o.size !== undefined && o.elements && o.add && o.replace && o.delete && isITryMakeCollectionKey(o);
}

export interface ISyncableRDOKeyBasedCollection<S, D> extends IMakeRdo<S, D>, ISyncableKeyBasedCollection<D>, ITryMakeCollectionKey<S>{}

export function IsISyncableRDOCollection(o: any): o is ISyncableRDOKeyBasedCollection<any, any> {
  return o && isIMakeRdoElement(o) && IsISyncableCollection(o);
}

export interface NodeAddHandler<T> {
  ({ index, key, newItem }: { index?: number; key: string | number; newItem: T }): boolean;
}

export interface NodeReplaceHandler<T> {
  ({ index, key, origItem, newItem }: { index?: number; key: string | number; origItem: any; newItem: T }): boolean;
}

export interface NodeDeleteHandler<T> {
  ({ index, key, origItem }: { index?: number; key: string | number; origItem: T }): boolean;
}
