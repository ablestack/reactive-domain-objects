import _ from 'lodash';
import { Logger } from './logger';
import { IMakeKey } from '.';

const logger = Logger.make('CollectionUtils');

const _Array = {
  getKeys: <T>({ collection, makeKey }: { collection: Array<T>; makeKey: IMakeKey<T> }) => collection.map((item) => makeKey(item)),
  getItem: <T>({ collection, makeKey, key }: { collection: Array<T>; makeKey: IMakeKey<T>; key: string }) => collection.find((item) => makeKey(item) === key),
  upsertItem: <T>({ collection, makeKey, key, value }: { collection: Array<T>; makeKey: IMakeKey<T>; key: string; value: T }) => {
    const existingItemIndex = collection.findIndex((item) => makeKey(item) === key);
    if (existingItemIndex) {
      collection.splice(existingItemIndex, 1, value);
    } else collection.push(value);
  },
  deleteItem: <T>({ collection, makeKey, key }: { collection: Array<T>; makeKey: IMakeKey<T>; key: string }) =>
    collection.splice(
      collection.findIndex((item) => makeKey(item) === key),
      1,
    ),
};

const _Set = {
  getKeys: <T>({ collection, makeKey }: { collection: Set<T>; makeKey: IMakeKey<T> }) => Array.from(collection.values()).map((domainItem) => makeKey(domainItem)),
  getItem: <T>({ collection, makeKey, key }: { collection: Set<T>; makeKey: IMakeKey<T>; key: string }) => Array.from(collection.values()).find((domainItem) => makeKey(domainItem) === key),
  upsertItem: <T>({ collection, makeKey, key, value }: { collection: Set<T>; makeKey: IMakeKey<T>; key: string; value: T }) => {
    const existingItem = Array.from(collection.values()).find((domainItem) => makeKey(domainItem) === key);
    if (existingItem) {
      collection.delete(existingItem);
    }
    collection.add(value);
  },
  deleteItem: <T>({ collection, makeKey, key }: { collection: Set<T>; makeKey: IMakeKey<T>; key: string }) => collection.delete(Array.from(collection.values()).find((domainItem) => makeKey(domainItem) === key)),
};

const _Record = {
  getKeys: <T>({ collection }: { collection: Record<string, any> }) => Object.keys(collection),
  getItem: <T>({ collection, key }: { collection: Record<string, any>; key: string }) => collection[key],
  upsertItem: <T>({ collection, key, value }: { collection: Record<string, any>; key: string; value: T }) => {
    collection[key] = value;
  },
  deleteItem: <T>({ collection, key }: { collection: Record<string, any>; key: string }) => {
    delete collection[key];
  },
};

//
//
//
export const CollectionUtils = { Array: _Array, Set: _Set, Record: _Record };
