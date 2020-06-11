/* eslint-disable @typescript-eslint/interface-name-prefix */

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

export type NodeKind = 'Primitive' | 'Array' | 'Object';
export type InternalNodeKind = Exclude<NodeKind, 'Primitive'>;

export type SourceNodeTypeInfo = { type: NodeKind | undefined; builtInType: JavaScriptBuiltInType };

export type RdoFieldType = 'Primitive' | 'Array' | 'Map' | 'Set' | 'ISyncableCollection' | 'Object';
export type RdoNodeTypeInfo = { type: RdoFieldType | undefined; builtInType: JavaScriptBuiltInType };

export interface ISourceNodeWrapper {
  readonly typeInfo: SourceNodeTypeInfo;
  readonly node: any;
}

export function isISourceNodeWrapper(o: any): o is ISourceNodeWrapper {
  return o && o.typeInfo && o.node !== undefined;
}

export interface ISourceInternalNodeWrapper<D> extends ISourceNodeWrapper {
  keys(): Iterable<string>;
  getItem(key: string): D | null | undefined;
  updateItem(value: D): boolean;
}

export function isISourceInternalNodeWrapper(o: any): o is ISourceInternalNodeWrapper<any> {
  return o && o.keys && o.getItem && o.updateItem && isISourceNodeWrapper(o);
}

export interface IRdoNodeWrapper {
  readonly node: any;
  readonly typeInfo: RdoNodeTypeInfo;
}

export function isIRdoNodeWrapper(o: any): o is IRdoNodeWrapper {
  return o && o.typeInfo && o.node !== undefined;
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
  size(): number;
  insertItem(value: D): void;
  deleteItem(key: string): boolean;
}

export function isIRdoCollectionNodeWrapper(o: any): o is IRdoCollectionNodeWrapper<any> {
  return o && o.size && o.insertItem && o.deleteItem && isIRdoInternalNodeWrapper(o);
}
