/* eslint-disable @typescript-eslint/interface-name-prefix */

export type PrimitiveType = string | number | boolean | bigint;
export type KeyType = string | number;

export interface IEqualityComparer {
  (a: any, b: any): boolean;
}
