export declare type eventType = 'nodeChange';
export declare type SubscriptionFunction<T> = (data: T) => void;
export declare class EventEmitter<T> {
    private registry;
    constructor();
    /** */
    subscribe(eventType: eventType, func: SubscriptionFunction<T>): void;
    /** */
    unsubscribe(eventType: eventType, func: SubscriptionFunction<T>): void;
    /** */
    publish(eventType: eventType, data: T): void;
}
