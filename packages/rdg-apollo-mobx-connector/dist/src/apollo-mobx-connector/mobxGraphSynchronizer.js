"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobxGraphSynchronizer = void 0;
const logger_1 = require("@ablestack/rdg/infrastructure/logger");
const rdg_1 = require("@ablestack/rdg");
const mobx_1 = require("mobx");
const logger = logger_1.Logger.make('MobxGraphSynchronizer');
class MobxGraphSynchronizer extends rdg_1.GraphSynchronizer {
    // ------------------------------------------------------------------------------------------------------------------
    // CONSTRUCTOR
    // ------------------------------------------------------------------------------------------------------------------
    constructor(options) {
        super(options);
    }
    smartSync({ rootSourceNode, rootRdo }) {
        logger.trace('smartSync - entering action', { rootSourceNode, rootSyncableObject: rootRdo });
        mobx_1.runInAction('trySynchronizeObject', () => {
            super.smartSync({ rootSourceNode, rootRdo });
        });
        logger.trace('smartSync - action completed', { rootSourceNode, rootSyncableObject: rootRdo });
    }
}
exports.MobxGraphSynchronizer = MobxGraphSynchronizer;
//# sourceMappingURL=mobxGraphSynchronizer.js.map