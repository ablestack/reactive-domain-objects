"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeTypeUtils = void 0;
const logger_1 = require("../../infrastructure/logger");
const __1 = require("../..");
const logger = logger_1.Logger.make('node-type.utils');
/**
 *
 */
function getNodeType(rdoNodeVal) {
    const stringifiedNodeType = toString.call(rdoNodeVal);
    if (__1.IsISyncableCollection(rdoNodeVal)) {
        return { kind: 'Collection', type: 'ISyncableCollection', stringifiedType: stringifiedNodeType };
    }
    switch (stringifiedNodeType) {
        case '[object Boolean]':
        case '[object Date]':
        case '[object Number]':
        case '[object String]': {
            return { kind: 'Primitive', type: 'Primitive', stringifiedType: stringifiedNodeType };
        }
        case '[object Object]': {
            return { kind: 'Object', type: 'Object', stringifiedType: stringifiedNodeType };
        }
        case '[object Array]': {
            return { kind: 'Collection', type: 'Array', stringifiedType: stringifiedNodeType };
        }
        case '[object Map]': {
            return { kind: 'Collection', type: 'Map', stringifiedType: stringifiedNodeType };
        }
        case '[object Set]': {
            return { kind: 'Collection', type: 'Set', stringifiedType: stringifiedNodeType };
        }
        default: {
            console.log('--------------', rdoNodeVal);
            throw new Error(`Unable to find RDO Node Type for type: ${stringifiedNodeType}`);
        }
    }
}
function isPrimitive(val) {
    switch (typeof val) {
        case 'bigint':
        case 'boolean':
        case 'number':
        case 'string': {
            return true;
        }
        case 'undefined':
        case null:
        default: {
            return false;
        }
    }
}
exports.NodeTypeUtils = { getNodeType, isPrimitive };
//# sourceMappingURL=node-type.utils.js.map