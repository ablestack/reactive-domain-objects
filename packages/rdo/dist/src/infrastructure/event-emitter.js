"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEmitter = void 0;
const logger_1 = require("./logger");
const logger = logger_1.Logger.make('RdoObjectNW');
class EventEmitter {
    constructor() {
        this.registry = new Map();
    }
    /** */
    subscribe(eventType, func) {
        if (!this.registry.has(eventType)) {
            this.registry.set(eventType, []);
        }
        this.registry.get(eventType).push(func);
    }
    /** */
    unsubscribe(eventType, func) {
        if (!this.registry.has(eventType))
            return;
        const subscribers = this.registry.get(eventType).filter((subfunc) => subfunc != func);
        if (subscribers.length > 0) {
            this.registry.set(eventType, subscribers);
        }
        else
            this.registry.delete(eventType);
    }
    /** */
    publish(eventType, data) {
        logger.trace(`publish: ${eventType}`, data);
        if (this.registry.has(eventType)) {
            this.registry.get(eventType).forEach((subscriber) => subscriber(data));
        }
    }
}
exports.EventEmitter = EventEmitter;
//# sourceMappingURL=event-emitter.js.map