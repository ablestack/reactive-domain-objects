"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoPrimitiveNW = void 0;
const __1 = require("..");
const __2 = require("../..");
const logger_1 = require("../../infrastructure/logger");
const logger = logger_1.Logger.make('RdoPrimitiveNW');
class RdoPrimitiveNW extends __1.RdoNWBase {
    constructor({ value, typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }) {
        super({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
        this._value = value;
    }
    //------------------------------
    // IRdoNodeWrapper
    //------------------------------
    get leafNode() {
        return true;
    }
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
        if (!this.wrappedParentRdoNode)
            throw new Error('Primitive RDO Node wrappers must have a Parent node, and can not be root Nodes. SourceNodePath:${this.wrappedSourceNode.sourceNodePath}');
        if (!__2.isIRdoInternalNodeWrapper(this.wrappedParentRdoNode))
            throw new Error(`Parent RDO Node wrappers must implement IRdoInternalNodeWrapper. SourceNodePath:${this.wrappedSourceNode.sourceNodePath}`);
        if (!this.key)
            throw new Error('Primitive RDO Node Wrapper - Key must not be null when synching. SourceNodePath:${this.wrappedSourceNode.sourceNodePath}');
        return RdoPrimitiveNW.sync({
            wrappedParentNode: this.wrappedParentRdoNode,
            sourceKey: this.wrappedSourceNode.key,
            rdoKey: this.key,
            newValue: this.wrappedSourceNode.value,
            eventEmitter: this.eventEmitter,
        });
    }
    static sync({ wrappedParentNode, sourceKey, rdoKey, newValue, eventEmitter, }) {
        const oldValue = wrappedParentNode.getItem(rdoKey);
        if (Object.is(oldValue, newValue)) {
            logger.trace(`smartSync - SourceNodePath:${wrappedParentNode.wrappedSourceNode.sourceNodePath}, values evaluate to Object.is equal. Not allocating value`, newValue);
            return false;
        }
        logger.trace(`primitive value found in domainPropKey ${rdoKey}. Setting from old value to new value`, newValue, oldValue);
        const changed = wrappedParentNode.updateItem(rdoKey, newValue);
        if (changed)
            eventEmitter.publish('nodeChange', {
                changeType: 'update',
                sourceNodePath: wrappedParentNode.wrappedSourceNode.sourceNodePath,
                sourceKey,
                rdoKey,
                oldSourceValue: oldValue,
                newSourceValue: newValue,
            });
        return changed;
    }
}
exports.RdoPrimitiveNW = RdoPrimitiveNW;
//# sourceMappingURL=rdo-primitive-nw.js.map