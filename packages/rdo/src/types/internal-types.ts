/* eslint-disable @typescript-eslint/interface-name-prefix */

import { IMakeCollectionKey } from '.';

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

export interface ISourceNodeWrapper {
  readonly typeInfo: SourceNodeTypeInfo;
  readonly node: any;
  readonly sourceNodePath: string;
  readonly lastSourceNode: any;
  childElementCount(): number;
}

export function isISourceNodeWrapper(o: any): o is ISourceNodeWrapper {
  return o && o.typeInfo && o.node !== undefined && o.sourceNodePath && o.lastSourceNode && o.childElementCount;
}

export interface ISourceInternalNodeWrapper<D> extends ISourceNodeWrapper {
  keys(): Iterable<string>;
  getItem(key: string): D | null | undefined;
  updateItem(value: D): boolean;
}

export function isISourceInternalNodeWrapper(o: any): o is ISourceInternalNodeWrapper<any> {
  return o && o.keys && o.getItem && o.updateItem && isISourceNodeWrapper(o);
}

export interface ISourceCollectionNodeWrapper<D> extends ISourceInternalNodeWrapper<D> {
  values(): Iterable<D>;
}

export function isISourceCollectionNodeWrapper(o: any): o is ISourceCollectionNodeWrapper<any> {
  return o && o.values && isISourceInternalNodeWrapper(o);
}

export interface IRdoNodeWrapper {
  readonly node: any;
  readonly typeInfo: RdoNodeTypeInfo;
  childElementCount(): number;
  smartSync<S>({ lastSourceObject }: { lastSourceObject: any }): boolean;
}

export function isIRdoNodeWrapper(o: any): o is IRdoNodeWrapper {
  return o && o.typeInfo && o.node !== undefined && o.size && o.smartSync;
}

export interface IRdoInternalNodeWrapper<D> extends IRdoNodeWrapper {
  keys(): Iterable<string>;
  getItem(key: string): D | null | undefined;
  updateItem(value: D): boolean;
}

export function isIRdoInternalNodeWrapper(o: any): o is IRdoInternalNodeWrapper<any> {
  return o && o.keys && o.getItem && o.updateItem && isIRdoNodeWrapper(o);
}

export interface IRdoCollectionNodeWrapper<D> extends IRdoInternalNodeWrapper<D> {
  makeKey: IMakeCollectionKey<D> | undefined;
  insertItem(value: D): void;
  deleteItem(key: string): boolean;
  clearItems(): boolean;
}

export function isIRdoCollectionNodeWrapper(o: any): o is IRdoCollectionNodeWrapper<any> {
  return o && o.makeKey && o.insertItem && o.deleteItem && o.clearItems && isIRdoInternalNodeWrapper(o);
}

export type ISyncChildElement<S, D> = ({ sourceElementKey, sourceElementVal, targetElementKey }: { sourceElementKey: string; sourceElementVal: S; targetElementKey: string; targetElementVal: D }) => boolean;
