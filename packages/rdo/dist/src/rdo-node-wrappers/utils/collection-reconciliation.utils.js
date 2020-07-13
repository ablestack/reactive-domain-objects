"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionReconciliationUtils = void 0;
const logger_1 = require("../../infrastructure/logger");
const logger = logger_1.Logger.make('CollectionUtils');
const _Array = {
    getCollectionKeys: ({ collection, makeCollectionKey }) => {
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
    getElement: ({ collection, makeCollectionKey, key }) => {
        return collection.length > 0 ? collection.find((item) => makeCollectionKey(item) === key) : undefined;
    },
    insertElement: ({ collection, key, value }) => collection.push(value),
    updateElement: ({ collection, makeCollectionKey, value }) => {
        if (collection.length === 0)
            return false;
        const key = makeCollectionKey(value);
        const existingItemIndex = collection.findIndex((item) => makeCollectionKey(item) === key);
        if (existingItemIndex) {
            collection.splice(existingItemIndex, 1, value);
            return true;
        }
        return false;
    },
    deleteElement: ({ collection, makeCollectionKey, key }) => {
        if (collection.length === 0)
            return undefined;
        const existingItemIndex = collection.findIndex((item) => makeCollectionKey(item) === key);
        if (existingItemIndex !== -1) {
            return collection.splice(existingItemIndex, 1)[0];
        }
        return undefined;
    },
};
const _Set = {
    getCollectionKeys: ({ collection, makeCollectionKey }) => collection.size > 0
        ? Array.from(collection.values()).map((item) => {
            const key = makeCollectionKey(item);
            if (!key)
                throw new Error('Set.getCollectionKeys - makeCollectionKey did not produce a value');
            return key;
        })
        : [],
    getElement: ({ collection, makeCollectionKey, key }) => collection.size > 0 ? Array.from(collection.values()).find((item) => makeCollectionKey(item) == key) : undefined,
    insertElement: ({ collection, key, value }) => {
        collection.add(value);
    },
    updateElement: ({ collection, makeCollectionKey, value }) => {
        if (collection.size === 0)
            return false;
        const key = makeCollectionKey(value);
        const existingItem = Array.from(collection.values()).find((item) => makeCollectionKey(item) === key);
        if (existingItem) {
            collection.delete(existingItem);
            collection.add(value);
            return true;
        }
        return false;
    },
    deleteElement: ({ collection, makeCollectionKey, key }) => {
        if (collection.size === 0)
            return undefined;
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
exports.CollectionReconciliationUtils = { Array: _Array, Set: _Set };
//# sourceMappingURL=collection-reconciliation.utils.js.map