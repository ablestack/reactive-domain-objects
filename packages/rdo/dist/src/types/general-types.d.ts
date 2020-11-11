export declare type PrimitiveType = string | number | boolean | bigint;
export interface IEqualityComparer {
    (a: any, b: any): boolean;
}
