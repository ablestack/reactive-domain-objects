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

export type JsonNodeKind = 'objectProperty' | 'arrayElement';

export type SourceNodeType = 'Primitive' | 'Array' | 'Object';
export type SourceNodeTypeInfo = { type: SourceNodeType | undefined; builtInType: JavaScriptBuiltInType };

export type RdoFieldType = 'Primitive' | 'Array' | 'Map' | 'Set' | 'ISyncableCollection' | 'Object';
export type RdoNodeTypeInfo = { type: RdoFieldType | undefined; builtInType: JavaScriptBuiltInType };

export interface IEqualityComparer {
  (a: any, b: any): boolean;
}
