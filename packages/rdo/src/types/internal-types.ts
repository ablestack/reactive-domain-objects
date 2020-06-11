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

export type NodeKind = 'Primitive' | 'Collection' | 'Object';
export type InternalNodeKind = Exclude<NodeKind, 'Primitive'>;

export type SourceNodeTypeInfo = { type: NodeKind | undefined; builtInType: JavaScriptBuiltInType };

export type RdoFieldType = 'Primitive' | 'Array' | 'Map' | 'Set' | 'ISyncableCollection' | 'Object';
export type RdoNodeTypeInfo = { type: RdoFieldType | undefined; builtInType: JavaScriptBuiltInType };

export interface IRdoInternalNodeWrapper<D> {
  keys(): Iterable<string>;
  getItem(key: string): D | null | undefined;
  updateItem(value: D): boolean;
}

export interface IRdoCollectionNodeWrapper<D> extends IRdoInternalNodeWrapper<D> {
  size(): number;
  insertItem(value: D): void;
  deleteItem(key: string): boolean;
}
