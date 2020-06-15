import _ from 'lodash';
import { IMakeCollectionKeyMethod } from '../..';
import { Logger } from '../../infrastructure/logger';

const logger = Logger.make('CollectionUtils');

const _Array = {
  getCollectionKeys: <T>({ collection, makeElementKey }: { collection: Array<T>; makeElementKey: IMakeCollectionKeyMethod<T> }) => {
    return collection.length > 0
      ? collection.map((item) => {
          const key = makeElementKey(item);
          if (!key) throw new Error('Array.getCollectionKeys - makeElementKey did not produce a value');
          return key;
        })
      : [];
  },
  getElement: <T>({ collection, makeElementKey, key }: { collection: Array<T>; makeElementKey: IMakeCollectionKeyMethod<T>; key: string }) => {
    return collection.length > 0 ? collection.find((item) => makeElementKey(item) === key) : undefined;
  },
  insertElement: <T>({ collection, key, value }: { collection: Array<T>; key: string; value: T }) => collection.push(value),
  updateElement: <T>({ collection, makeElementKey, value }: { collection: Array<T>; makeElementKey: IMakeCollectionKeyMethod<T>; value: T }) => {
    if (collection.length === 0) return false;
    const key = makeElementKey(value);
    const existingItemIndex = collection.findIndex((item) => makeElementKey(item) === key);
    if (existingItemIndex) {
      collection.splice(existingItemIndex, 1, value);
      return true;
    }
    return false;
  },
  deleteElement: <T>({ collection, makeElementKey, key }: { collection: Array<T>; makeElementKey: IMakeCollectionKeyMethod<T>; key: string }) => {
    if (collection.length === 0) return false;
    const existingItemIndex = collection.findIndex((item) => makeElementKey(item) === key);
    if (existingItemIndex !== -1) {
      collection.splice(existingItemIndex, 1);
      return true;
    }
    return false;
  },
  clear: <T>({ collection }: { collection: Array<T> }) => collection.splice(0, collection.length).length > 0,
};

const _Set = {
  getCollectionKeys: <T>({ collection, makeElementKey }: { collection: Set<T>; makeElementKey: IMakeCollectionKeyMethod<T> }) =>
    collection.size > 0
      ? Array.from(collection.values()).map((item) => {
          const key = makeElementKey(item);
          if (!key) throw new Error('Set.getCollectionKeys - makeElementKey did not produce a value');
          return key;
        })
      : [],
  getElement: <T>({ collection, makeElementKey, key }: { collection: Set<T>; makeElementKey: IMakeCollectionKeyMethod<T>; key: string }) => (collection.size > 0 ? Array.from(collection.values()).find((item) => makeElementKey(item) == key) : undefined),
  insertElement: <T>({ collection, key, value }: { collection: Set<T>; key: string; value: T }) => {
    collection.add(value);
  },
  updateElement: <T>({ collection, makeElementKey, value }: { collection: Set<T>; makeElementKey: IMakeCollectionKeyMethod<T>; value: T }) => {
    if (collection.size === 0) return false;
    const key = makeElementKey(value);
    const existingItem = Array.from(collection.values()).find((item) => makeElementKey(item) === key);
    if (existingItem) {
      collection.delete(existingItem);
      collection.add(value);
      return true;
    }
    return false;
  },
  deleteElement: <T>({ collection, makeElementKey, key }: { collection: Set<T>; makeElementKey: IMakeCollectionKeyMethod<T>; key: string }) => {
    if (collection.size === 0) return false;
    const item = Array.from(collection.values()).find((item) => makeElementKey(item) === key);
    if (item) {
      collection.delete(item);
      return true;
    }
    return false;
  },
};

const _Record = {
  deleteElement: <T>({ record, key }: { record: Record<string, T>; key: string }) => {
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
