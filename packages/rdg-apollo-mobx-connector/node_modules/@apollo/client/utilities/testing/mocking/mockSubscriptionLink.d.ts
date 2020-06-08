/// <reference types="zen-observable" />
import { Observable } from '../../../utilities/observables/Observable';
import { ApolloLink } from '../../../link/core/ApolloLink';
import { FetchResult, Operation } from '../../../link/core/types';
export interface MockedSubscription {
    request: Operation;
}
export interface MockedSubscriptionResult {
    result?: FetchResult;
    error?: Error;
    delay?: number;
}
export declare class MockSubscriptionLink extends ApolloLink {
    unsubscribers: any[];
    setups: any[];
    private observer;
    constructor();
    request(_req: any): Observable<FetchResult<{
        [key: string]: any;
    }, Record<string, any>, Record<string, any>>>;
    simulateResult(result: MockedSubscriptionResult, complete?: boolean): void;
    simulateComplete(): void;
    onSetup(listener: any): void;
    onUnsubscribe(listener: any): void;
}
export declare function mockObservableLink(): MockSubscriptionLink;
//# sourceMappingURL=mockSubscriptionLink.d.ts.map