import { SourceNodeTypeInfo, RdoNodeTypeInfo } from '../..';
/**
 *
 */
declare function getSourceNodeType(sourceNodeVal: any): SourceNodeTypeInfo;
/**
 *
 */
declare function getRdoNodeType(rdoNodeVal: any): RdoNodeTypeInfo;
declare function isPrimitive(val: any): boolean;
export declare const NodeTypeUtils: {
    getSourceNodeType: typeof getSourceNodeType;
    getRdoNodeType: typeof getRdoNodeType;
    isPrimitive: typeof isPrimitive;
};
export {};
