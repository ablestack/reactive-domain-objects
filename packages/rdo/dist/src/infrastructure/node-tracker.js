"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeTracker = void 0;
const logger_1 = require("./logger");
const logger = logger_1.Logger.make('NodeTracker');
class NodeTracker {
    constructor() {
        this._sourceNodeInstancePathStack = new Array();
        this._sourceNodeTypePathStack = new Array();
    }
    pushSourceNodeInstancePathOntoStack(key, sourceNodeKind) {
        logger.trace(`Adding SourceNode to sourceNodeInstancePathStack: ${this.getSourceNodeInstancePath()} + ${key} (parent:${sourceNodeKind})`);
        this._sourceNodeInstancePathStack.push(key.toString());
        // reset locally cached dependencies
        this._sourceNodeInstancePath = undefined;
        // push to typepath if objectProperty
        if (sourceNodeKind === 'Object') {
            this._sourceNodeTypePathStack.push(key.toString());
            // reset locally cached dependencies
            this._sourceNodeTypePath = undefined;
        }
    }
    popSourceNodeInstancePathFromStack(sourceNodeKind) {
        const key = this._sourceNodeInstancePathStack.pop();
        logger.trace(`Popping ${key} off sourceNodeInstancePathStack: ${this.getSourceNodeInstancePath()} (${sourceNodeKind})`);
        // reset locally cached dependencies
        this._sourceNodeInstancePath = undefined;
        // pop from typepath if objectProperty
        if (sourceNodeKind === 'Object') {
            this._sourceNodeTypePathStack.pop();
            // reset locally cached dependencies
            this._sourceNodeTypePath = undefined;
        }
    }
    getSourceNodeInstancePath() {
        if (!this._sourceNodeInstancePath)
            this._sourceNodeInstancePath = this._sourceNodeInstancePathStack.join(NodeTracker.nodePathSeperator);
        return this._sourceNodeInstancePath || '';
    }
    getSourceNodePath() {
        if (!this._sourceNodeTypePath)
            this._sourceNodeTypePath = this._sourceNodeTypePathStack.join(NodeTracker.nodePathSeperator);
        return this._sourceNodeTypePath || '';
    }
}
exports.NodeTracker = NodeTracker;
NodeTracker.nodePathSeperator = '/';
//# sourceMappingURL=node-tracker.js.map