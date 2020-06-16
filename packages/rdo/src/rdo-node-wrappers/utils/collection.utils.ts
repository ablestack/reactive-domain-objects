import _ from 'lodash';
import { MakeCollectionKeyMethod } from '../..';
import { Logger } from '../../infrastructure/logger';

const logger = Logger.make('CollectionUtils');

const _Array = {
  getCollectionKeys: <T>({ collection, makeCollectionKey }: { collection: Array<T>; makeCollectionKey: MakeCollectionKeyMethod<T> }) => {
    return collection.length > 0
      ? collection.map((item) => {
          const key = makeCollectionKey(item);
          if (!key) throw new Error('Array.getCollectionKeys - makeCollectionKey did not produce a value');
          return key;
        })
      : [];
  },
  getElement: <T>({ collection, makeCollectionKey, key }: { collection: Array<T>; makeCollectionKey: MakeCollectionKeyMethod<T>; key: string }) => {
    return collection.length > 0 ? collection.find((item) => makeCollectionKey(item) === key) : undefined;
  },
  insertElement: <T>({ collection, key, value }: { collection: Array<T>; key: string; value: T }) => collection.push(value),
  updateElement: <T>({ collection, makeCollectionKey, value }: { collection: Array<T>; makeCollectionKey: MakeCollectionKeyMethod<T>; value: T }) => {
    if (collection.length === 0) return false;
    const key = makeCollectionKey(value);
    const existingItemIndex = collection.findIndex((item) => makeCollectionKey(item) === key);
    if (existingItemIndex) {
      collection.splice(existingItemIndex, 1, value);
      return true;
    }
    return false;
  },
  deleteElement: <T>({ collection, makeCollectionKey, key }: { collection: Array<T>; makeCollectionKey: MakeCollectionKeyMethod<T>; key: string }) => {
    if (collection.length === 0) return false;
    const existingItemIndex = collection.findIndex((item) => makeCollectionKey(item) === key);
    if (existingItemIndex !== -1) {
      collection.splice(existingItemIndex, 1);
      return true;
    }
    return false;
  },
  clear: <T>({ collection }: { collection: Array<T> }) => collection.splice(0, collection.length).length > 0,
};

const _Set = {
  getCollectionKeys: <T>({ collection, makeCollectionKey }: { collection: Set<T>; makeCollectionKey: MakeCollectionKeyMethod<T> }) =>
    collection.size > 0
      ? Array.from(collection.values()).map((item) => {
          const key = makeCollectionKey(item);
          if (!key) throw new Error('Set.getCollectionKeys - makeCollectionKey did not produce a value');
          return key;
        })
      : [],
  getElement: <T>({ collection, makeCollectionKey, key }: { collection: Set<T>; makeCollectionKey: MakeCollectionKeyMethod<T>; key: string }) =>
    collection.size > 0 ? Array.from(collection.values()).find((item) => makeCollectionKey(item) == key) : undefined,
  insertElement: <T>({ collection, key, value }: { collection: Set<T>; key: string; value: T }) => {
    collection.add(value);
  },
  updateElement: <T>({ collection, makeCollectionKey, value }: { collection: Set<T>; makeCollectionKey: MakeCollectionKeyMethod<T>; value: T }) => {
    if (collection.size === 0) return false;
    const key = makeCollectionKey(value);
    const existingItem = Array.from(collection.values()).find((item) => makeCollectionKey(item) === key);
    if (existingItem) {
      collection.delete(existingItem);
      collection.add(value);
      return true;
    }
    return false;
  },
  deleteElement: <T>({ collection, makeCollectionKey, key }: { collection: Set<T>; makeCollectionKey: MakeCollectionKeyMethod<T>; key: string }) => {
    if (collection.size === 0) return false;
    const item = Array.from(collection.values()).find((item) => makeCollectionKey(item) === key);
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
