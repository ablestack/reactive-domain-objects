import equal from '@wry/equality';

export interface IEqualsComparer<T> {
  (a: T, b: T): boolean;
}
export interface IUpdateIfNotEqual<T> {
  (a: T, b: T, set:(T) => void): boolean;
}


function apolloComparer(a: any, b: any): boolean {
  return equal(a, b);
}

function identityComparer(a: any, b: any): boolean {
  return a === b;
}

// function structuralComparer(a: any, b: any): boolean {
//   // FUTURE
//   // return deepEqual(a, b);
//   return false;
// }

// function shallowComparer(a: any, b: any): boolean {
//   // FUTURE
//   //return deepEqual(a, b, 1);
//   return false;
// }

function referentialComparer(a: any, b: any): boolean {
  return Object.is(a, b);
}

function _updateIfNotEqual<T>(comparer:IEqualsComparer<T | null>, origVal: T | null, newVal:T, set: (T) => void) : boolean {
  if(comparer(origVal, newVal)) return false;
  origVal = newVal;
  set(newVal);
  return true;
}

export const comparers = {
  valueGraph: apolloComparer,
  identity: identityComparer,
  //structural: structuralComparer,
  referential: referentialComparer,
  //shallow: shallowComparer,
};

export const comparerUtils = {
  valueGraph: {
    updateIfNotEqual: <T>(origVal: T, newVal:T, set: (T) => void) => _updateIfNotEqual(comparers.valueGraph, origVal, newVal, set),
  },
  identity: {
    updateIfNotEqual: <T>(origVal: T, newVal:T, set: (T) => void) => _updateIfNotEqual(comparers.identity, origVal, newVal, set),
  },
  //structural: structuralComparer,
  referential:{
    updateIfNotEqual: <T>(origVal: T, newVal:T, set: (T) => void) => _updateIfNotEqual(comparers.referential, origVal, newVal, set),
  }
  //shallow: shallowComparer,
};
