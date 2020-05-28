import { deepEqual } from 'mobx/lib/utils/eq';
import equal from '@wry/equality';

export interface IEqualsComparer<T> {
  (a: T, b: T): boolean;
}

function apolloComparer(a: any, b: any): boolean {
  return equal(a, b);
}

function identityComparer(a: any, b: any): boolean {
  return a === b;
}

function structuralComparer(a: any, b: any): boolean {
  return deepEqual(a, b);
}

function shallowComparer(a: any, b: any): boolean {
  return deepEqual(a, b, 1);
}

function defaultComparer(a: any, b: any): boolean {
  return Object.is(a, b);
}

export const comparers = {
  apollo: apolloComparer,
  identity: identityComparer,
  structural: structuralComparer,
  default: defaultComparer,
  shallow: shallowComparer,
};
