import _ from 'lodash';
import { Logger } from './logger';
import { IMakeKey } from '.';

const logger = Logger.make('CollectionUtils');

const _Array = {
  getKeys: <T>({ collection, makeKeyFromDomainItem }: { collection: Array<T>; makeKeyFromDomainItem: IMakeKey<T> }) => collection.map((item) => makeKeyFromDomainItem(item)),
  getItem: <T>({ collection, makeKeyFromDomainItem, key }: { collection: Array<T>; makeKeyFromDomainItem: IMakeKey<T>; key: string }) =>
    collection.find((item) => {
      console.log(` -------> makeKeyFromDomainItem: ${makeKeyFromDomainItem(item)}, key: ${key}`);
      return makeKeyFromDomainItem(item) === key;
    }),
  upsertItem: <T>({ collection, makeKeyFromDomainItem, key, value }: { collection: Array<T>; makeKeyFromDomainItem: IMakeKey<T>; key: string; value: T }) => {
    const existingItemIndex = collection.findIndex((item) => makeKeyFromDomainItem(item) === key);
    if (existingItemIndex) {
      collection.splice(existingItemIndex, 1, value);
    } else collection.push(value);
  },
  deleteItem: <T>({ collection, makeKeyFromDomainItem, key }: { collection: Array<T>; makeKeyFromDomainItem: IMakeKey<T>; key: string }) =>
    collection.splice(
      collection.findIndex((item) => makeKeyFromDomainItem(item) === key),
      1,
    ),
};

const _Set = {
  getKeys: <T>({ collection, makeKeyFromDomainItem }: { collection: Set<T>; makeKeyFromDomainItem: IMakeKey<T> }) => Array.from(collection.values()).map((domainItem) => makeKeyFromDomainItem(domainItem)),
  getItem: <T>({ collection, makeKeyFromDomainItem, key }: { collection: Set<T>; makeKeyFromDomainItem: IMakeKey<T>; key: string }) =>
    Array.from(collection.values()).find((domainItem) => makeKeyFromDomainItem(domainItem) == key),
  upsertItem: <T>({ collection, makeKeyFromDomainItem, key, value }: { collection: Set<T>; makeKeyFromDomainItem: IMakeKey<T>; key: string; value: T }) => {
    const existingItem = Array.from(collection.values()).find((domainItem) => makeKeyFromDomainItem(domainItem) === key);
    if (existingItem) {
      collection.delete(existingItem);
    }
    collection.add(value);
  },
  deleteItem: <T>({ collection, makeKeyFromDomainItem, key }: { collection: Set<T>; makeKeyFromDomainItem: IMakeKey<T>; key: string }) => {
    const item = Array.from(collection.values()).find((domainItem) => makeKeyFromDomainItem(domainItem) === key);
    if (item) collection.delete(item);
  },
};

const _Record = {
  getKeys: <T>({ collection }: { collection: Record<string, TextDecodeOptions> }) => Object.keys(collection),
  getItem: <T>({ collection, key }: { collection: Record<string, T>; key: string }) => collection[key],
  upsertItem: <T>({ collection, key, value }: { collection: Record<string, T>; key: string; value: T }) => {
    collection[key] = value;
  },
  deleteItem: <T>({ collection, key }: { collection: Record<string, T>; key: string }) => {
    delete collection[key];
  },
};

//
//
//
export const CollectionUtils = { Array: _Array, Set: _Set, Record: _Record };
