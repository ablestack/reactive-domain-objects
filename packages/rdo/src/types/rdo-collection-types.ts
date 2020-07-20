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
  onNewKey: NodeAddHandler;
  onReplaceKey: NodeReplaceHandler;
  onDeleteKey: NodeDeleteHandler;
}

export function isIRdoKeyBasedCollectionNodeWrapper(o: any): o is IRdoCollectionNodeWrapper<any, any> {
  return o && o.onNewKey && o.onReplaceKey && o.onDeleteKey && isIRdoCollectionNodeWrapper(o);
}

export interface ISyncableKeyBasedCollection<S, D> extends ITryMakeCollectionKey<S> {
  readonly size: number;
  elements(): Iterable<D>;
  handleNewKey({ index, key, nextRdo }: { index?: number; key: string | number; nextRdo: any });
  handleReplaceKey({ index, key, lastRdo, nextRdo }: { index?: number; key: string | number; lastRdo: any; nextRdo: any });
  handleDeleteKey({ index, key, lastRdo }: { index?: number; key: string | number; lastRdo: any });
}

export function IsISyncableCollection(o: any): o is ISyncableKeyBasedCollection<any, any> {
  return o && o.size !== undefined && o.elements && o.handleNewKey && o.handleReplaceKey && o.handleDeleteKey && isITryMakeCollectionKey(o);
}

export interface ISyncableRDOKeyBasedCollection<S, D> extends IMakeRdo<S, D>, ISyncableKeyBasedCollection<S, D> {}

export function IsISyncableRDOCollection(o: any): o is ISyncableRDOKeyBasedCollection<any, any> {
  return o && isIMakeRdoElement(o) && IsISyncableCollection(o);
}

export interface NodeAddHandler {
  ({ index, key, nextRdo }: { index?: number; key: string | number; nextRdo: any }): boolean;
}

export interface NodeReplaceHandler {
  ({ index, key, lastRdo, nextRdo }: { index?: number; key: string | number; lastRdo: any; nextRdo: any }): boolean;
}

export interface NodeDeleteHandler {
  ({ index, key, lastRdo }: { index?: number; key: string | number; lastRdo: any }): boolean;
}
