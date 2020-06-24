"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeTracker = void 0;
const logger_1 = require("./logger");
const logger = logger_1.Logger.make('NodeTracker');
class NodeTracker {
    constructor() {
        this._nodePathSeperator = '/';
        this._sourceNodeInstancePathStack = new Array();
        this._sourceNodePathStack = new Array();
    }
    pushSourceNodeInstancePathOntoStack(key, sourceNodeKind) {
        logger.trace(`Adding SourceNode to sourceNodeInstancePathStack: ${this.getSourceNodeInstancePath()} + ${key} (parent:${sourceNodeKind})`);
        this._sourceNodeInstancePathStack.push(key.toString());
        // reset locally cached dependencies
        this._sourceNodeInstancePath = undefined;
        // push to typepath if objectProperty
        if (sourceNodeKind === 'Object') {
            this._sourceNodePathStack.push(key.toString());
            // reset locally cached dependencies
            this._sourceNodePath = undefined;
        }
    }
    popSourceNodeInstancePathFromStack(sourceNodeKind) {
        const key = this._sourceNodeInstancePathStack.pop();
        logger.trace(`Popping ${key} off sourceNodeInstancePathStack: ${this.getSourceNodeInstancePath()} (${sourceNodeKind})`);
        // reset locally cached dependencies
        this._sourceNodeInstancePath = undefined;
        // pop from typepath if objectProperty
        if (sourceNodeKind === 'Object') {
            this._sourceNodePathStack.pop();
            // reset locally cached dependencies
            this._sourceNodePath = undefined;
        }
    }
    getSourceNodeInstancePath() {
        if (!this._sourceNodeInstancePath)
            this._sourceNodeInstancePath = this._sourceNodeInstancePathStack.join(this._nodePathSeperator);
        return this._sourceNodeInstancePath || '';
    }
    getSourceNodePath() {
        if (!this._sourceNodePath)
            this._sourceNodePath = this._sourceNodePathStack.join(this._nodePathSeperator);
        return this._sourceNodePath || '';
    }
}
exports.NodeTracker = NodeTracker;
//# sourceMappingURL=node-tracker.js.map