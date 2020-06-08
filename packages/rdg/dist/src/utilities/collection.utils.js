"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionUtils = void 0;
const logger_1 = require("../infrastructure/logger");
const logger = logger_1.Logger.make('CollectionUtils');
const _Array = {
    getKeys: ({ collection, makeKey }) => {
        return collection.length > 0 ? collection.map((item) => makeKey(item)) : [];
    },
    getItem: ({ collection, makeKey, key }) => {
        return collection.length > 0 ? collection.find((item) => makeKey(item) === key) : undefined;
    },
    insertItem: ({ collection, key, value }) => collection.push(value),
    updateItem: ({ collection, makeKey, value }) => {
        if (collection.length === 0)
            return;
        const key = makeKey(value);
        const existingItemIndex = collection.findIndex((item) => makeKey(item) === key);
        if (existingItemIndex) {
            collection.splice(existingItemIndex, 1, value);
        }
    },
    deleteItem: ({ collection, makeKey, key }) => {
        if (collection.length === 0)
            return;
        collection.splice(collection.findIndex((item) => makeKey(item) === key), 1);
    },
    clear: ({ collection }) => collection.splice(0, collection.length),
};
const _Set = {
    getKeys: ({ collection, makeKey }) => (collection.size > 0 ? Array.from(collection.values()).map((domainItem) => makeKey(domainItem)) : []),
    tryGetItem: ({ collection, makeKey, key }) => collection.size > 0 ? Array.from(collection.values()).find((domainItem) => makeKey(domainItem) == key) : undefined,
    insertItem: ({ collection, key, value }) => {
        collection.add(value);
    },
    tryUpdateItem: ({ collection, makeKey, value }) => {
        if (collection.size === 0)
            return;
        const key = makeKey(value);
        const existingItem = Array.from(collection.values()).find((domainItem) => makeKey(domainItem) === key);
        if (existingItem) {
            collection.delete(existingItem);
        }
        collection.add(value);
    },
    tryDeleteItem: ({ collection, makeKey, key }) => {
        if (collection.size === 0)
            return;
        const item = Array.from(collection.values()).find((domainItem) => makeKey(domainItem) === key);
        if (item)
            collection.delete(item);
    },
};
const _Record = {
    getKeys: ({ collection }) => Object.keys(collection),
    tryGetItem: ({ collection, key }) => collection[key],
    insertItem: ({ collection, key, value }) => {
        collection[key] = value;
    },
    tryUpdateItem: ({ collection, key, value }) => {
        collection[key] = value;
    },
    tryDeleteItem: ({ collection, key }) => {
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
exports.CollectionUtils = { Array: _Array, Set: _Set, Record: _Record, isIterable };
//# sourceMappingURL=collection.utils.js.map