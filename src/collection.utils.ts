import _ from 'lodash';
import { Logger } from './logger';
import { IMakeKey } from '.';

const logger = Logger.make('CollectionUtils');

const _Array = {
  getKeys: <T>({ collection, makeKey }: { collection: Array<T>; makeKey: IMakeKey<T> }) => collection.map((item) => makeKey(item)),
  getItem: <T>({ collection, makeKey, key }: { collection: Array<T>; makeKey: IMakeKey<T>; key: string }) =>
    collection.find((item) => {
      return makeKey(item) === key;
    }),
  insertItem: <T>({ collection, key, value }: { collection: Array<T>; key: string; value: T }) => {
    collection.push(value);
  },
  updateItem: <T>({ collection, makeKey, value }: { collection: Array<T>; makeKey: IMakeKey<T>; value: T }) => {
    const key = makeKey(value);
    const existingItemIndex = collection.findIndex((item) => makeKey(item) === key);
    if (existingItemIndex) {
      collection.splice(existingItemIndex, 1, value);
    }
  },
  deleteItem: <T>({ collection, makeKey, key }: { collection: Array<T>; makeKey: IMakeKey<T>; key: string }) =>
    collection.splice(
      collection.findIndex((item) => makeKey(item) === key),
      1,
    ),
};

const _Set = {
  getKeys: <T>({ collection, makeKey }: { collection: Set<T>; makeKey: IMakeKey<T> }) => Array.from(collection.values()).map((domainItem) => makeKey(domainItem)),
  getItem: <T>({ collection, makeKey, key }: { collection: Set<T>; makeKey: IMakeKey<T>; key: string }) => Array.from(collection.values()).find((domainItem) => makeKey(domainItem) == key),
  insertItem: <T>({ collection, key, value }: { collection: Set<T>; key: string; value: T }) => {
    collection.add(value);
  },
  updateItem: <T>({ collection, makeKey, value }: { collection: Set<T>; makeKey: IMakeKey<T>; value: T }) => {
    const key = makeKey(value);
    const existingItem = Array.from(collection.values()).find((domainItem) => makeKey(domainItem) === key);
    if (existingItem) {
      collection.delete(existingItem);
    }
    collection.add(value);
  },
  deleteItem: <T>({ collection, makeKey, key }: { collection: Set<T>; makeKey: IMakeKey<T>; key: string }) => {
    const item = Array.from(collection.values()).find((domainItem) => makeKey(domainItem) === key);
    if (item) collection.delete(item);
  },
};

const _Record = {
  getKeys: <T>({ collection }: { collection: Record<string, TextDecodeOptions> }) => Object.keys(collection),
  getItem: <T>({ collection, key }: { collection: Record<string, T>; key: string }) => collection[key],
  insertItem: <T>({ collection, key, value }: { collection: Record<string, T>; key: string; value: T }) => {
    collection[key] = value;
  },
  updateItem: <T>({ collection, key, value }: { collection: Record<string, T>; key: string; value: T }) => {
    collection[key] = value;
  },
  deleteItem: <T>({ collection, key }: { collection: Record<string, T>; key: string }) => {
    delete collection[key];
  },
};

function isIterable(obj) {
  // checks for null and undefined
  if (obj == null) {
    return false;
  }
  return typeof obj[Symbol.iterator] === 'function';
}

//
//
//
export const CollectionUtils = { Array: _Array, Set: _Set, Record: _Record, isIterable };
