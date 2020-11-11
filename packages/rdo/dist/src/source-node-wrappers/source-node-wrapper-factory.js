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
    make({ sourceNodeTypePath, sourceNodeInstancePath, value, key, matchingNodeOptions, }) {
        const typeInfo = node_type_utils_1.NodeTypeUtils.getNodeType(value);
        switch (typeInfo.kind) {
            case 'Primitive': {
                return new source_primitive_nw_1.SourcePrimitiveNW({ value, key, sourceNodeTypePath, sourceNodeInstancePath, typeInfo, matchingNodeOptions, globalNodeOptions: this._globalNodeOptions });
            }
            case 'Object': {
                const o = new _1.SourceObjectNW({ value, sourceNodeTypePath, sourceNodeInstancePath, key, typeInfo, matchingNodeOptions, globalNodeOptions: this._globalNodeOptions });
                return o;
            }
            case 'Collection': {
                return new _1.SourceArrayNW({ value, sourceNodeTypePath, sourceNodeInstancePath, key, typeInfo, matchingNodeOptions, globalNodeOptions: this._globalNodeOptions });
            }
            default: {
                throw new Error(`Unable to make IRdoInternalNodeWrapper for type: ${typeInfo.stringifiedType}`);
            }
        }
    }
}
exports.SourceNodeWrapperFactory = SourceNodeWrapperFactory;
//# sourceMappingURL=source-node-wrapper-factory.js.map