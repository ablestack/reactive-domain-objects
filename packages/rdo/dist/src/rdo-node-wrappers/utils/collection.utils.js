"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionUtils = void 0;
const logger_1 = require("../../infrastructure/logger");
const logger = logger_1.Logger.make('CollectionUtils');
const _Array = {
    clear: ({ collection }) => collection.splice(0, collection.length).length > 0,
};
const _Record = {
    deleteElement: ({ record, key }) => {
        if (key in record) {
            const item = record[key];
            delete record[key];
            return item;
        }
        return undefined;
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
exports.CollectionUtils = { Array: _Array, Record: _Record, isIterable };
//# sourceMappingURL=collection.utils.js.map