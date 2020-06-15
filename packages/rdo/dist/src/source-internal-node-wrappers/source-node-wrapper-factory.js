"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceNodeWrapperFactory = void 0;
const node_type_utils_1 = require("../rdo-node-wrappers/utils/node-type.utils");
const source_primitive_nw_1 = require("./concrete/source-primitive-nw");
const _1 = require(".");
class SourceNodeWrapperFactory {
    constructor({ globalNodeOptions }) {
        this._globalNodeOptions = globalNodeOptions;
    }
    make({ sourceNodePath, value, key, lastSourceNode, matchingNodeOptions, }) {
        const typeInfo = node_type_utils_1.NodeTypeUtils.getSourceNodeType(value);
        switch (typeInfo.kind) {
            case 'Primitive': {
                return new source_primitive_nw_1.SourcePrimitiveNW({ value, key, sourceNodePath, typeInfo, lastSourceNode, matchingNodeOptions, globalNodeOptions: this._globalNodeOptions });
            }
            case 'Object': {
                return new _1.SourceObjectNW({ value, sourceNodePath, key, typeInfo, lastSourceNode, matchingNodeOptions, globalNodeOptions: this._globalNodeOptions });
            }
            case 'Collection': {
                return new _1.SourceArrayNW({ value, sourceNodePath, key, typeInfo, lastSourceNode, matchingNodeOptions, globalNodeOptions: this._globalNodeOptions });
            }
            default: {
                throw new Error(`Unable to make IRdoInternalNodeWrapper for type: ${typeInfo.builtInType}`);
            }
        }
    }
}
exports.SourceNodeWrapperFactory = SourceNodeWrapperFactory;
//# sourceMappingURL=source-node-wrapper-factory.js.map