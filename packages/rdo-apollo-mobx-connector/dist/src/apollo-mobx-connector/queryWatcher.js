"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryWatcher = void 0;
const tslib_1 = require("tslib");
const uuid_1 = tslib_1.__importDefault(require("uuid"));
const logger_1 = require("@ablestack/rdo/infrastructure/logger");
const logger = logger_1.Logger.make('ViewModelSyncUtils');
class QueryWatcher {
    constructor({ name, makeObservableQuery, onAfterInitialized, onAfterStart: onStart, onDataChange, onAfterStop: onStop, }) {
        this._active = false;
        this._uuid = uuid_1.default.v4();
        this._name = name;
        this._makeObservableQuery = makeObservableQuery;
        this._onAfterInitialized = onAfterInitialized;
        this._onAfterStart = onStart;
        this._handleDataChange = onDataChange;
        this._onAfterStop = onStop;
    }
    get active() {
        return this._active;
    }
    //
    async initialize(apolloClient) {
        if (!this._watchedQuery) {
            this._watchedQuery = await this._makeObservableQuery(apolloClient);
            logger.trace(`${this._name} - watchedQuery initialized`, this._watchedQuery);
        }
        if (this._onAfterInitialized) {
            await this._onAfterInitialized(apolloClient);
        }
    }
    // The force parameter will trigger a refetch of data even if already available
    start(apolloClient, force = true) {
        if (this.active)
            return;
        this.initiateWatch({ apolloClient, runOnce: false, force });
        logger.trace(`${this._name} - Started`);
        if (this._onAfterStart)
            this._onAfterStart(apolloClient);
    }
    //
    runOnce(apolloClient) {
        if (this.active)
            return;
        this.initiateWatch({ apolloClient, runOnce: true, force: true });
        logger.trace(`${this._name} - RunOnce`);
        if (this._onAfterStart)
            this._onAfterStart(apolloClient);
    }
    //
    stop(apolloClient) {
        var _a;
        if (this._active) {
            (_a = this._watchedQuerySubscription) === null || _a === void 0 ? void 0 : _a.unsubscribe();
            this._active = false;
            logger.trace(`${this._name} - Stopped`);
            if (this._onAfterStop)
                this._onAfterStop(apolloClient);
        }
    }
    // The force parameter will trigger a refetch of data even if already available
    initiateWatch({ apolloClient, runOnce, force }) {
        if (!this._watchedQuery) {
            logger.error(`QueryWatcher must be initialized before use (${this._name})`, this._watchedQuery);
            return;
        }
        logger.info(`${this._name} - Starting`);
        if (force)
            this._watchedQuery.resetLastResults();
        this._watchedQuerySubscription = this._watchedQuery.subscribe((next) => {
            logger.trace(`${this._name} - watchedQuerySubscription - Result`, next);
            if (next.data) {
                this._handleDataChange(next.data);
                if (runOnce)
                    this.stop(apolloClient);
            }
        }, (error) => {
            logger.error(`${this._name} - watchedQuerySubscription - ERROR`);
            this.stop(apolloClient);
        }, () => {
            logger.info(`${this._name} - watchedQuerySubscription - Completed`);
            this.stop(apolloClient);
        });
        this._active = true;
    }
}
exports.QueryWatcher = QueryWatcher;
//# sourceMappingURL=queryWatcher.js.map