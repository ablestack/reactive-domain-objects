"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionUtils = void 0;
const logger_1 = require("../../infrastructure/logger");
const logger = logger_1.Logger.make('CollectionUtils');
const _Array = {
    getCollectionKeys: ({ collection, makeElementKey }) => {
        return collection.length > 0
            ? collection.map((item) => {
                const key = makeElementKey(item);
                if (!key)
                    throw new Error('Array.getCollectionKeys - makeElementKey did not produce a value');
                return key;
            })
            : [];
    },
    getElement: ({ collection, makeElementKey, key }) => {
        return collection.length > 0 ? collection.find((item) => makeElementKey(item) === key) : undefined;
    },
    insertElement: ({ collection, key, value }) => collection.push(value),
    updateElement: ({ collection, makeElementKey, value }) => {
        if (collection.length === 0)
            return false;
        const key = makeElementKey(value);
        const existingItemIndex = collection.findIndex((item) => makeElementKey(item) === key);
        if (existingItemIndex) {
            collection.splice(existingItemIndex, 1, value);
            return true;
        }
        return false;
    },
    deleteElement: ({ collection, makeElementKey, key }) => {
        if (collection.length === 0)
            return false;
        const existingItemIndex = collection.findIndex((item) => makeElementKey(item) === key);
        if (existingItemIndex !== -1) {
            collection.splice(existingItemIndex, 1);
            return true;
        }
        return false;
    },
    clear: ({ collection }) => collection.splice(0, collection.length).length > 0,
};
const _Set = {
    getCollectionKeys: ({ collection, makeElementKey }) => collection.size > 0
        ? Array.from(collection.values()).map((item) => {
            const key = makeElementKey(item);
            if (!key)
                throw new Error('Set.getCollectionKeys - makeElementKey did not produce a value');
            return key;
        })
        : [],
    getElement: ({ collection, makeElementKey, key }) => (collection.size > 0 ? Array.from(collection.values()).find((item) => makeElementKey(item) == key) : undefined),
    insertElement: ({ collection, key, value }) => {
        collection.add(value);
    },
    updateElement: ({ collection, makeElementKey, value }) => {
        if (collection.size === 0)
            return false;
        const key = makeElementKey(value);
        const existingItem = Array.from(collection.values()).find((item) => makeElementKey(item) === key);
        if (existingItem) {
            collection.delete(existingItem);
            collection.add(value);
            return true;
        }
        return false;
    },
    deleteElement: ({ collection, makeElementKey, key }) => {
        if (collection.size === 0)
            return false;
        const item = Array.from(collection.values()).find((item) => makeElementKey(item) === key);
        if (item) {
            collection.delete(item);
            return true;
        }
        return false;
    },
};
const _Record = {
    deleteElement: ({ record, key }) => {
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
exports.CollectionUtils = { Array: _Array, Set: _Set, Record: _Record, isIterable };
//# sourceMappingURL=collection.utils.js.map