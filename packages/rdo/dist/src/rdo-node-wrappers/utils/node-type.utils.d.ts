import { NodeTypeInfo } from '../..';
/**
 *
 */
declare function getNodeType(rdoNodeVal: any): NodeTypeInfo;
declare function isPrimitive(val: any): boolean;
export declare const NodeTypeUtils: {
    getNodeType: typeof getNodeType;
    isPrimitive: typeof isPrimitive;
};
export {};
