import _ from 'lodash';
import { Logger } from '../infrastructure/logger';
import { IMakeRdoCollectionKey } from '..';

const logger = Logger.make('CollectionUtils');

const _Array = {
  getKeys: <T>({ collection, makeCollectionKey }: { collection: Array<T>; makeCollectionKey: IMakeRdoCollectionKey<T> }) => {
    return collection.length > 0 ? collection.map((item) => makeCollectionKey(item)) : [];
  },
  getItem: <T>({ collection, makeCollectionKey, key }: { collection: Array<T>; makeCollectionKey: IMakeRdoCollectionKey<T>; key: string }) => {
    return collection.length > 0 ? collection.find((item) => makeCollectionKey(item) === key) : undefined;
  },
  insertItem: <T>({ collection, key, value }: { collection: Array<T>; key: string; value: T }) => collection.push(value),
  updateItem: <T>({ collection, makeCollectionKey, value }: { collection: Array<T>; makeCollectionKey: IMakeRdoCollectionKey<T>; value: T }) => {
    if (collection.length === 0) return;
    const key = makeCollectionKey(value);
    const existingItemIndex = collection.findIndex((item) => makeCollectionKey(item) === key);
    if (existingItemIndex) {
      collection.splice(existingItemIndex, 1, value);
    }
  },
  deleteItem: <T>({ collection, makeCollectionKey, key }: { collection: Array<T>; makeCollectionKey: IMakeRdoCollectionKey<T>; key: string }) => {
    if (collection.length === 0) return;
    collection.splice(
      collection.findIndex((item) => makeCollectionKey(item) === key),
      1,
    );
  },
  clear: <T>({ collection }: { collection: Array<T> }) => collection.splice(0, collection.length),
};

const _Set = {
  getKeys: <T>({ collection, makeCollectionKey }: { collection: Set<T>; makeCollectionKey: IMakeRdoCollectionKey<T> }) =>
    collection.size > 0 ? Array.from(collection.values()).map((domainItem) => makeCollectionKey(domainItem)) : [],
  tryGetItem: <T>({ collection, makeCollectionKey, key }: { collection: Set<T>; makeCollectionKey: IMakeRdoCollectionKey<T>; key: string }) =>
    collection.size > 0 ? Array.from(collection.values()).find((domainItem) => makeCollectionKey(domainItem) == key) : undefined,
  insertItem: <T>({ collection, key, value }: { collection: Set<T>; key: string; value: T }) => {
    collection.add(value);
  },
  tryUpdateItem: <T>({ collection, makeCollectionKey, value }: { collection: Set<T>; makeCollectionKey: IMakeRdoCollectionKey<T>; value: T }) => {
    if (collection.size === 0) return;
    const key = makeCollectionKey(value);
    const existingItem = Array.from(collection.values()).find((domainItem) => makeCollectionKey(domainItem) === key);
    if (existingItem) {
      collection.delete(existingItem);
    }
    collection.add(value);
  },
  tryDeleteItem: <T>({ collection, makeCollectionKey, key }: { collection: Set<T>; makeCollectionKey: IMakeRdoCollectionKey<T>; key: string }) => {
    if (collection.size === 0) return;
    const item = Array.from(collection.values()).find((domainItem) => makeCollectionKey(domainItem) === key);
    if (item) collection.delete(item);
  },
};

const _Record = {
  getKeys: <T>({ record }: { record: Record<string, TextDecodeOptions> }) => Object.keys(record),
  tryGetItem: <T>({ record, key }: { record: Record<string, T>; key: string }) => record[key],
  insertItem: <T>({ record, key, value }: { record: Record<string, T>; key: string; value: T }) => {
    record[key] = value;
  },
  tryUpdateItem: <T>({ record, key, value }: { record: Record<string, T>; key: string; value: T }) => {
    record[key] = value;
  },
  tryDeleteItem: <T>({ record, key }: { record: Record<string, T>; key: string }) => {
    delete record[key];
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
