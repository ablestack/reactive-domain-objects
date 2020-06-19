import { Logger } from './logger';

export type eventType = 'nodeChange';
export type SubscriptionFunction<T> = (data: T) => void;

const logger = Logger.make('RdoObjectNW');

export class EventEmitter<T> {
  private registry: Map<eventType, SubscriptionFunction<T>[]>;

  constructor() {
    this.registry = new Map<eventType, SubscriptionFunction<T>[]>();
  }

  /** */
  public subscribe(eventType: eventType, func: SubscriptionFunction<T>) {
    if (!this.registry.has(eventType)) {
      this.registry.set(eventType, []);
    }
    this.registry.get(eventType)!.push(func);
  }

  /** */
  public unsubscribe(eventType: eventType, func: SubscriptionFunction<T>) {
    if (!this.registry.has(eventType)) return;

    const subscribers = this.registry.get(eventType)!.filter((subfunc) => subfunc != func);
    if (subscribers.length > 0) {
      this.registry.set(eventType, subscribers);
    } else this.registry.delete(eventType);
  }

  /** */
  public publish(eventType: eventType, data: T) {
    logger.trace(`publish: ${eventType}`, data);
    if (this.registry.has(eventType)) {
      this.registry.get(eventType)!.forEach((subscriber) => subscriber(data));
    }
  }
}
