"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoNodeWrapperFactory = void 0;
const _1 = require(".");
const logger_1 = require("../infrastructure/logger");
const node_type_utils_1 = require("./utils/node-type.utils");
const logger = logger_1.Logger.make('RdoNodeWrapperFactory');
class RdoNodeWrapperFactory {
    constructor({ eventEmitter, syncChildNode, globalNodeOptions, targetedOptionMatchersArray, wrapRdoNode, defaultEqualityComparer, }) {
        this._eventEmitter = eventEmitter;
        this._syncChildNode = syncChildNode;
        this._globalNodeOptions = globalNodeOptions;
        this._wrapRdoNode = wrapRdoNode;
        this._defaultEqualityComparer = defaultEqualityComparer;
        this._targetedOptionMatchersArray = targetedOptionMatchersArray;
    }
    make({ value, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, matchingNodeOptions, }) {
        if (value === null || value === undefined)
            throw new Error('Rdo value should not be null or undefined');
        const typeInfo = node_type_utils_1.NodeTypeUtils.getNodeType(value);
        // Check if custom collection type
        if (typeInfo.type === 'ISyncableKeyBasedCollection') {
            logger.trace(`Wrapping Node ${key} with RdoMapNW - sourceNodeTypePath: ${wrappedSourceNode.sourceNodeTypePath}`);
            return new _1.RdoSyncableCollectionNW({
                value: value,
                typeInfo,
                key,
                mutableNodeCache,
                wrappedParentRdoNode,
                wrappedSourceNode,
                syncChildNode: this._syncChildNode,
                defaultEqualityComparer: this._defaultEqualityComparer,
                matchingNodeOptions,
                globalNodeOptions: this._globalNodeOptions,
                targetedOptionMatchersArray: this._targetedOptionMatchersArray,
                eventEmitter: this._eventEmitter,
            });
        }
        // Else use built in stringified types to generate appropriate wrapper
        switch (typeInfo.stringifiedType) {
            case '[object Boolean]':
            case '[object Date]':
            case '[object Number]':
            case '[object String]': {
                throw new Error(`Can not wrap primitive nodes. Primitive node sync should be handled in objects and collection wrappers. Key:${key}. SourceNodePath:${wrappedSourceNode.sourceNodeTypePath}`);
            }
            case '[object Object]': {
                logger.trace(`Wrapping Node ${key} with RdoObjectNW - sourceNodeTypePath: ${wrappedSourceNode.sourceNodeTypePath}`);
                const wrappedSourceNodeTyped = wrappedSourceNode;
                const o = new _1.RdoObjectNW({
                    value,
                    key,
                    mutableNodeCache,
                    wrappedParentRdoNode,
                    wrappedSourceNode: wrappedSourceNodeTyped,
                    typeInfo,
                    defaultEqualityComparer: this._defaultEqualityComparer,
                    syncChildNode: this._syncChildNode,
                    wrapRdoNode: this._wrapRdoNode,
                    matchingNodeOptions,
                    globalNodeOptions: this._globalNodeOptions,
                    targetedOptionMatchersArray: this._targetedOptionMatchersArray,
                    eventEmitter: this._eventEmitter,
                });
                return o;
            }
            case '[object Array]': {
                logger.trace(`Wrapping Node ${key} with RdoArrayNW - sourceNodeTypePath: ${wrappedSourceNode.sourceNodeTypePath}`);
                const wrappedSourceNodeTyped = wrappedSourceNode;
                const a = new _1.RdoArrayNW({
                    value: value,
                    typeInfo,
                    key: key,
                    mutableNodeCache,
                    wrappedParentRdoNode,
                    wrappedSourceNode: wrappedSourceNodeTyped,
                    syncChildNode: this._syncChildNode,
                    defaultEqualityComparer: this._defaultEqualityComparer,
                    matchingNodeOptions,
                    globalNodeOptions: this._globalNodeOptions,
                    targetedOptionMatchersArray: this._targetedOptionMatchersArray,
                    eventEmitter: this._eventEmitter,
                });
                return a;
            }
            case '[object Map]': {
                logger.trace(`Wrapping Node ${key} with RdoMapNW - sourceNodeTypePath: ${wrappedSourceNode.sourceNodeTypePath}`);
                return new _1.RdoMapNW({
                    value: value,
                    typeInfo,
                    key,
                    mutableNodeCache,
                    wrappedParentRdoNode,
                    wrappedSourceNode,
                    syncChildNode: this._syncChildNode,
                    defaultEqualityComparer: this._defaultEqualityComparer,
                    matchingNodeOptions,
                    globalNodeOptions: this._globalNodeOptions,
                    targetedOptionMatchersArray: this._targetedOptionMatchersArray,
                    eventEmitter: this._eventEmitter,
                });
            }
            case '[object Set]': {
                logger.trace(`Wrapping Node ${key} with RdoSetNW - sourceNodeTypePath: ${wrappedSourceNode.sourceNodeTypePath}`);
                return new _1.RdoSetNW({
                    value: value,
                    typeInfo,
                    key,
                    mutableNodeCache,
                    wrappedParentRdoNode,
                    wrappedSourceNode,
                    syncChildNode: this._syncChildNode,
                    defaultEqualityComparer: this._defaultEqualityComparer,
                    matchingNodeOptions,
                    globalNodeOptions: this._globalNodeOptions,
                    targetedOptionMatchersArray: this._targetedOptionMatchersArray,
                    eventEmitter: this._eventEmitter,
                });
            }
            default: {
                throw new Error(`Unable to make IRdoInternalNodeWrapper for type: ${typeInfo.stringifiedType}`);
            }
        }
    }
}
exports.RdoNodeWrapperFactory = RdoNodeWrapperFactory;
//# sourceMappingURL=rdo-node-wrapper-factory.js.map