export declare type JavaScriptBuiltInType = '[object Array]' | '[object Boolean]' | '[object Date]' | '[object Error]' | '[object Map]' | '[object Number]' | '[object Object]' | '[object RegExp]' | '[object Set]' | '[object String]' | '[object Undefined]';
export declare type JsonNodeKind = 'objectProperty' | 'arrayElement';
export declare type SourceNodeType = 'Primitive' | 'Array' | 'Object';
export declare type SourceNodeTypeInfo = {
    type: SourceNodeType | undefined;
    builtInType: JavaScriptBuiltInType;
};
export declare type RdoFieldType = 'Primitive' | 'Array' | 'Map' | 'Set' | 'ISyncableCollection' | 'Object';
export declare type RdoFieldTypeInfo = {
    type: RdoFieldType | undefined;
    builtInType: JavaScriptBuiltInType;
};
export interface IEqualityComparer {
    (a: any, b: any): boolean;
}
