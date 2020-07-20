/* eslint-disable @typescript-eslint/interface-name-prefix */

import { IMakeRdo, IRdoInternalNodeWrapper, isIRdoInternalNodeWrapper } from './internal-types';

//--------------------------------------------------------
// RDO COLLECTION - SYNC CUSTOMIZATION INTERFACES
//-------------------------------------------------------

export type MakeCollectionKeyMethod<K extends string | number, T> = (item: T) => K;

export interface ITryMakeCollectionKey<K extends string | number, T> {
  tryMakeCollectionKey: (item: T, index: number) => K | undefined;
}

export function isITryMakeCollectionKey(o: any): o is IMakeCollectionKey<any, any> {
  return o && o.tryMakeCollectionKey;
}
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

export interface IRdoCollectionNodeWrapper<K extends string | number, S, D> extends IRdoInternalNodeWrapper<K, S, D> {
  elements(): Iterable<D | undefined>;
}

export function isIRdoCollectionNodeWrapper(o: any): o is IRdoCollectionNodeWrapper<any, any, any> {
  return o && o.elements && isIRdoInternalNodeWrapper(o) && isIMakeCollectionKey(o);
}

export interface IRdoKeyBasedCollectionNodeWrapper<K extends string | number, S, D> extends IRdoInternalNodeWrapper<K, S, D> {
  onNewKey: NodeAddHandler<K>;
  onReplaceKey: NodeReplaceHandler<K>;
  onDeleteKey: NodeDeleteHandler<K>;
}

export function isIRdoKeyBasedCollectionNodeWrapper(o: any): o is IRdoCollectionNodeWrapper<any, any, any> {
  return o && o.onNewKey && o.onReplaceKey && o.onDeleteKey && isIRdoCollectionNodeWrapper(o);
}

export interface ISyncableKeyBasedCollection<K extends string | number, S, D> extends ITryMakeCollectionKey<K, S> {
  readonly size: number;
  elements(): Iterable<D>;
  handleNewKey({ index, key, nextRdo }: { index?: number; key: K; nextRdo: any });
  handleReplaceKey({ index, key, lastRdo, nextRdo }: { index?: number; key: K; lastRdo: any; nextRdo: any });
  handleDeleteKey({ index, key, lastRdo }: { index?: number; key: K; lastRdo: any });
}

export function IsISyncableCollection(o: any): o is ISyncableKeyBasedCollection<any, any, any> {
  return o && o.size !== undefined && o.elements && o.patchAdd && o.patchDelete && isIMakeCollectionKey(o);
}

export interface ISyncableRDOKeyBasedCollection<K extends string | number, S, D> extends IMakeRdo<K, S, D>, ISyncableKeyBasedCollection<K, S, D> {}

export function IsISyncableRDOCollection(o: any): o is ISyncableRDOKeyBasedCollection<any, any, any> {
  return o && isIMakeRdoElement(o) && IsISyncableCollection(o);
}

export interface NodeAddHandler<K extends string | number> {
  ({ index, key, nextRdo }: { index?: number; key: K; nextRdo: any }): boolean;
}

export interface NodeReplaceHandler<K extends string | number> {
  ({ index, key, lastRdo, nextRdo }: { index?: number; key: K; lastRdo: any; nextRdo: any }): boolean;
}

export interface NodeDeleteHandler<K extends string | number> {
  ({ index, key, lastRdo }: { index?: number; key: K; lastRdo: any }): boolean;
}
