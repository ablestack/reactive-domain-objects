/* eslint-disable @typescript-eslint/interface-name-prefix */

import { IMakeCollectionKey, IMakeRdo } from '.';

export type JavaScriptBuiltInType =
  | '[object Array]'
  | '[object Boolean]'
  | '[object Date]'
  | '[object Error]'
  | '[object Map]'
  | '[object Number]'
  | '[object Object]'
  | '[object RegExp]'
  | '[object Set]'
  | '[object String]'
  | '[object Undefined]';

export type NodeKind = 'Primitive' | 'Collection' | 'Object' | undefined;
export type InternalNodeKind = Exclude<NodeKind, 'Primitive'>;

export type SourceNodeTypeInfo = { kind: NodeKind | undefined; builtInType: JavaScriptBuiltInType };

export type RdoFieldType = 'Primitive' | 'Array' | 'Map' | 'Set' | 'ISyncableCollection' | 'Object';
export type RdoNodeTypeInfo = { kind: NodeKind; type: RdoFieldType | undefined; builtInType: JavaScriptBuiltInType };

export interface ISourceNodeWrapper<S> {
  readonly typeInfo: SourceNodeTypeInfo;
  readonly value: S | null | undefined;
  readonly key: string | undefined;
  readonly sourceNodePath: string;
  readonly lastSourceNode: S | undefined;
  childElementCount(): number;
}

export function isISourceNodeWrapper(o: any): o is ISourceNodeWrapper<any> {
  return o && o.typeInfo && o.node !== undefined && o.sourceNodePath && o.lastSourceNode && o.childElementCount;
}

export interface ISourceInternalNodeWrapper<S> extends ISourceNodeWrapper<S> {
  itemKeys(): Iterable<string>;
  getItem(key: string): S | null | undefined;
  updateItem(value: S): boolean;
}

export function isISourceInternalNodeWrapper(o: any): o is ISourceInternalNodeWrapper<any> {
  return o && o.itemKeys && o.getItem && o.updateItem && isISourceNodeWrapper(o);
}

export interface ISourceCollectionNodeWrapper<S> extends ISourceInternalNodeWrapper<S> {
  elements(): Iterable<S>;
  makeItemKey: IMakeCollectionKey<S> | undefined;
}

export function isISourceCollectionNodeWrapper(o: any): o is ISourceCollectionNodeWrapper<any> {
  return o && o.elements && o.makeItemKey && isISourceInternalNodeWrapper(o);
}

export interface IRdoNodeWrapper<S, D> {
  readonly value: D;
  readonly key: string | undefined;
  readonly parent: IRdoNodeWrapper<any, any> | undefined;
  readonly typeInfo: RdoNodeTypeInfo;
  readonly wrappedSourceNode: ISourceNodeWrapper<S>;
  childElementCount(): number;
  smartSync(): boolean;
}

export function isIRdoNodeWrapper(o: any): o is IRdoNodeWrapper<any, any> {
  return o && o.value !== undefined && o.key && o.parent && o.typeInfo && o.wrappedSourceNode && o.childElementCount && o.smartSync;
}

export interface IRdoInternalNodeWrapper<S, D> extends IRdoNodeWrapper<S, D> {
  itemKeys(): Iterable<string>;
  getItem(key: string): D | null | undefined;
  updateItem(key: string, value: D): boolean;
}

export function isIRdoInternalNodeWrapper(o: any): o is IRdoInternalNodeWrapper<any, any> {
  return o && o.itemKeys && o.getItem && o.updateItem && isIRdoNodeWrapper(o);
}

export interface IRdoCollectionNodeWrapper<S, D> extends IRdoInternalNodeWrapper<S, D> {
  makeItem: IMakeRdo<S, D>;
  makeItemKey: IMakeCollectionKey<D> | undefined;
  insertItem(value: D): void;
  deleteItem(key: string): boolean;
  clearItems(): boolean;
}

export function isIRdoCollectionNodeWrapper(o: any): o is IRdoCollectionNodeWrapper<any, any> {
  return o && o.makeItemKey && o.insertItem && o.deleteItem && o.clearItems && isIRdoInternalNodeWrapper(o);
}

export type ISyncChildElement<S, D> = ({ sourceElementKey, sourceElementVal, targetElementKey }: { sourceElementKey: string; sourceElementVal: S; targetElementKey: string; targetElementVal: D }) => boolean;
