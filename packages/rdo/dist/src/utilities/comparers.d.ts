export interface IEqualsComparer<T> {
    (a: T, b: T): boolean;
}
declare function apolloComparer(a: any, b: any): boolean;
declare function identityComparer(a: any, b: any): boolean;
declare function defaultComparer(a: any, b: any): boolean;
export declare const comparers: {
    apollo: typeof apolloComparer;
    identity: typeof identityComparer;
    default: typeof defaultComparer;
};
export {};
