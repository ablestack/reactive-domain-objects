import _ from 'lodash';
import { MakeCollectionKeyMethod } from '../..';
import { Logger } from '../../infrastructure/logger';

const logger = Logger.make('CollectionUtils');

const _Array = {
  getCollectionKeys: <K extends string | number, T>({ collection, makeCollectionKey }: { collection: Array<T>; makeCollectionKey: MakeCollectionKeyMethod<K, T> }) => {
    return collection.length > 0
      ? collection.map((item) => {
          const key = makeCollectionKey(item);
          if (!key) {
            throw new Error('Array.getCollectionKeys - makeCollectionKey did not produce a value');
          }
          return key;
        })
      : [];
  },
  getElement: <K extends string | number, T>({ collection, makeCollectionKey, key }: { collection: Array<T>; makeCollectionKey: MakeCollectionKeyMethod<K, T>; key: K }) => {
    return collection.length > 0 ? collection.find((item) => makeCollectionKey(item) === key) : undefined;
  },
  insertElement: <K extends string | number, T>({ collection, key, value }: { collection: Array<T>; key: K; value: T }) => collection.push(value),
  updateElement: <K extends string | number, T>({ collection, makeCollectionKey, value }: { collection: Array<T>; makeCollectionKey: MakeCollectionKeyMethod<K, T>; value: T }) => {
    if (collection.length === 0) return false;
    const key = makeCollectionKey(value);
    const existingItemIndex = collection.findIndex((item) => makeCollectionKey(item) === key);
    if (existingItemIndex) {
      collection.splice(existingItemIndex, 1, value);
      return true;
    }
    return false;
  },
  deleteElement: <K extends string | number, T>({ collection, makeCollectionKey, key }: { collection: Array<T>; makeCollectionKey: MakeCollectionKeyMethod<K, T>; key: K }): T | undefined => {
    if (collection.length === 0) return undefined;
    const existingItemIndex = collection.findIndex((item) => makeCollectionKey(item) === key);
    if (existingItemIndex !== -1) {
      return collection.splice(existingItemIndex, 1)[0];
    }
    return undefined;
  },
};

const _Set = {
  getCollectionKeys: <K extends string | number, T>({ collection, makeCollectionKey }: { collection: Set<T>; makeCollectionKey: MakeCollectionKeyMethod<K, T> }) =>
    collection.size > 0
      ? Array.from(collection.values()).map((item) => {
          const key = makeCollectionKey(item);
          if (!key) throw new Error('Set.getCollectionKeys - makeCollectionKey did not produce a value');
          return key;
        })
      : [],
  getElement: <K extends string | number, T>({ collection, makeCollectionKey, key }: { collection: Set<T>; makeCollectionKey: MakeCollectionKeyMethod<K, T>; key: K }) =>
    collection.size > 0 ? Array.from(collection.values()).find((item) => makeCollectionKey(item) == key) : undefined,
  insertElement: <K extends string | number, T>({ collection, key, value }: { collection: Set<T>; key: K; value: T }) => {
    collection.add(value);
  },
  updateElement: <K extends string | number, T>({ collection, makeCollectionKey, value }: { collection: Set<T>; makeCollectionKey: MakeCollectionKeyMethod<K, T>; value: T }) => {
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
  deleteElement: <K extends string | number, T>({ collection, makeCollectionKey, key }: { collection: Set<T>; makeCollectionKey: MakeCollectionKeyMethod<K, T>; key: K }): T | undefined => {
    if (collection.size === 0) return undefined;
    const item = Array.from(collection.values()).find((item) => makeCollectionKey(item) === key);
    if (item) {
      collection.delete(item);
      return item;
    }
    return undefined;
  },
};

//
//
//
export const CollectionReconciliationUtils = { Array: _Array, Set: _Set };
