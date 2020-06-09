"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionUtils = void 0;
const logger_1 = require("../infrastructure/logger");
const logger = logger_1.Logger.make('CollectionUtils');
const _Array = {
    getKeys: ({ collection, makeCollectionKey }) => {
        return collection.length > 0 ? collection.map((item) => makeCollectionKey(item)) : [];
    },
    getItem: ({ collection, makeCollectionKey, key }) => {
        return collection.length > 0 ? collection.find((item) => makeCollectionKey(item) === key) : undefined;
    },
    insertItem: ({ collection, key, value }) => collection.push(value),
    updateItem: ({ collection, makeCollectionKey, value }) => {
        if (collection.length === 0)
            return;
        const key = makeCollectionKey(value);
        const existingItemIndex = collection.findIndex((item) => makeCollectionKey(item) === key);
        if (existingItemIndex) {
            collection.splice(existingItemIndex, 1, value);
        }
    },
    deleteItem: ({ collection, makeCollectionKey, key }) => {
        if (collection.length === 0)
            return;
        collection.splice(collection.findIndex((item) => makeCollectionKey(item) === key), 1);
    },
    clear: ({ collection }) => collection.splice(0, collection.length),
};
const _Set = {
    getKeys: ({ collection, makeCollectionKey }) => collection.size > 0 ? Array.from(collection.values()).map((domainItem) => makeCollectionKey(domainItem)) : [],
    tryGetItem: ({ collection, makeCollectionKey, key }) => collection.size > 0 ? Array.from(collection.values()).find((domainItem) => makeCollectionKey(domainItem) == key) : undefined,
    insertItem: ({ collection, key, value }) => {
        collection.add(value);
    },
    tryUpdateItem: ({ collection, makeCollectionKey, value }) => {
        if (collection.size === 0)
            return;
        const key = makeCollectionKey(value);
        const existingItem = Array.from(collection.values()).find((domainItem) => makeCollectionKey(domainItem) === key);
        if (existingItem) {
            collection.delete(existingItem);
        }
        collection.add(value);
    },
    tryDeleteItem: ({ collection, makeCollectionKey, key }) => {
        if (collection.size === 0)
            return;
        const item = Array.from(collection.values()).find((domainItem) => makeCollectionKey(domainItem) === key);
        if (item)
            collection.delete(item);
    },
};
const _Record = {
    getKeys: ({ record }) => Object.keys(record),
    tryGetItem: ({ record, key }) => record[key],
    insertItem: ({ record, key, value }) => {
        record[key] = value;
    },
    tryUpdateItem: ({ record, key, value }) => {
        record[key] = value;
    },
    tryDeleteItem: ({ record, key }) => {
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
exports.CollectionUtils = { Array: _Array, Set: _Set, Record: _Record, isIterable };
//# sourceMappingURL=collection.utils.js.map