/* eslint-disable @typescript-eslint/interface-name-prefix */

export type PrimitiveType = string | number | boolean | bigint;

export interface IEqualityComparer {
  (a: any, b: any): boolean;
}
