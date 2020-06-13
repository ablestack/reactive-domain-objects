import _ from 'lodash';
import { Logger } from '../infrastructure/logger';
import { IMakeCollectionKey } from '..';

const logger = Logger.make('CollectionUtils');

const _Array = {
  getKeys: <T>({ collection, makeItemKey }: { collection: Array<T>; makeItemKey: IMakeCollectionKey<T> }) => {
    return collection.length > 0 ? collection.map((item) => makeItemKey(item)) : [];
  },
  getItem: <T>({ collection, makeItemKey, key }: { collection: Array<T>; makeItemKey: IMakeCollectionKey<T>; key: string }) => {
    return collection.length > 0 ? collection.find((item) => makeItemKey(item) === key) : undefined;
  },
  insertItem: <T>({ collection, key, value }: { collection: Array<T>; key: string; value: T }) => collection.push(value),
  updateItem: <T>({ collection, makeItemKey, value }: { collection: Array<T>; makeItemKey: IMakeCollectionKey<T>; value: T }) => {
    if (collection.length === 0) return false;
    const key = makeItemKey(value);
    const existingItemIndex = collection.findIndex((item) => makeItemKey(item) === key);
    if (existingItemIndex) {
      collection.splice(existingItemIndex, 1, value);
      return true;
    }
    return false;
  },
  deleteItem: <T>({ collection, makeItemKey, key }: { collection: Array<T>; makeItemKey: IMakeCollectionKey<T>; key: string }) => {
    if (collection.length === 0) return false;
    const existingItemIndex = collection.findIndex((item) => makeItemKey(item) === key);
    if (existingItemIndex !== -1) {
      collection.splice(existingItemIndex, 1);
      return true;
    }
    return false;
  },
  clear: <T>({ collection }: { collection: Array<T> }) => collection.splice(0, collection.length).length > 0,
};

const _Set = {
  getKeys: <T>({ collection, makeItemKey }: { collection: Set<T>; makeItemKey: IMakeCollectionKey<T> }) => (collection.size > 0 ? Array.from(collection.values()).map((domainItem) => makeItemKey(domainItem)) : []),
  getItem: <T>({ collection, makeItemKey, key }: { collection: Set<T>; makeItemKey: IMakeCollectionKey<T>; key: string }) =>
    collection.size > 0 ? Array.from(collection.values()).find((domainItem) => makeItemKey(domainItem) == key) : undefined,
  insertItem: <T>({ collection, key, value }: { collection: Set<T>; key: string; value: T }) => {
    collection.add(value);
  },
  updateItem: <T>({ collection, makeItemKey, value }: { collection: Set<T>; makeItemKey: IMakeCollectionKey<T>; value: T }) => {
    if (collection.size === 0) return false;
    const key = makeItemKey(value);
    const existingItem = Array.from(collection.values()).find((domainItem) => makeItemKey(domainItem) === key);
    if (existingItem) {
      collection.delete(existingItem);
      collection.add(value);
      return true;
    }
    return false;
  },
  deleteItem: <T>({ collection, makeItemKey, key }: { collection: Set<T>; makeItemKey: IMakeCollectionKey<T>; key: string }) => {
    if (collection.size === 0) return false;
    const item = Array.from(collection.values()).find((domainItem) => makeItemKey(domainItem) === key);
    if (item) {
      collection.delete(item);
      return true;
    }
    return false;
  },
};

const _Record = {
  deleteItem: <T>({ record, key }: { record: Record<string, T>; key: string }) => {
    if (key in record) {
      delete record[key];
      return true;
    }
    return false;
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
