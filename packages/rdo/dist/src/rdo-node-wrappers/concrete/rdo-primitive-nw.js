"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoPrimitiveNW = void 0;
const __1 = require("..");
const __2 = require("../..");
const logger_1 = require("../../infrastructure/logger");
const logger = logger_1.Logger.make('RdoPrimitiveNW');
class RdoPrimitiveNW extends __1.RdoNWBase {
    constructor({ value, key, wrappedParentRdoNode, wrappedSourceNode, typeInfo, matchingNodeOptions, globalNodeOptions, }) {
        super({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, matchingNodeOptions, globalNodeOptions });
        this._value = value;
    }
    //------------------------------
    // IRdoNodeWrapper
    //------------------------------
    get value() {
        return this._value;
    }
    childElementCount() {
        return 0;
    }
    smartSync() {
        if (this.wrappedSourceNode.typeInfo.builtInType !== this.typeInfo.builtInType) {
            throw Error(`For primitive types, the source type and the domain type must match. Source type: '${this.wrappedSourceNode.typeInfo.builtInType}', rdoNodeTypeInfo: ${this.typeInfo.builtInType}`);
        }
        if (!Object.is(this.wrappedSourceNode.value, this.value)) {
            logger.trace(`primitive value found in domainPropKey ${this.key}. Setting from old value to new value`, this.value, this.wrappedSourceNode.value);
            if (!this.wrappedParentRdoNode)
                throw new Error('Primitive RDO Node wrappers must have a Parent node, and can not be root Nodes. SourceNodePath:${this.wrappedSourceNode.sourceNodePath}');
            //@ts-ignore
            console.log(`wrappedParentRdoNode.key`, this.wrappedParentRdoNode.key);
            if (!__2.isIRdoInternalNodeWrapper(this.wrappedParentRdoNode))
                throw new Error(`Parent RDO Node wrappers must implement IRdoInternalNodeWrapper. SourceNodePath:${this.wrappedSourceNode.sourceNodePath}`);
            if (!this.key)
                throw new Error('Primitive RDO Node Wrapper - Key must not be null when synching. SourceNodePath:${this.wrappedSourceNode.sourceNodePath}');
            return this.wrappedParentRdoNode.updateElement(this.key, this.wrappedSourceNode.value);
        }
        return false;
    }
}
exports.RdoPrimitiveNW = RdoPrimitiveNW;
//# sourceMappingURL=rdo-primitive-nw.js.map