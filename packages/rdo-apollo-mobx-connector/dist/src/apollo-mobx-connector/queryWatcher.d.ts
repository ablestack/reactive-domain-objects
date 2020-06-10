import { ObservableQuery, ApolloClient } from '@apollo/client';
export declare class QueryWatcher<Q> {
    private _watchedQuery;
    private _watchedQuerySubscription;
    private _active;
    private _name;
    private _makeObservableQuery;
    private _handleDataChange;
    private _onAfterInitialized?;
    private _onAfterStart?;
    private _onAfterStop?;
    private _uuid;
    get active(): boolean;
    constructor({ name, makeObservableQuery, onAfterInitialized, onAfterStart: onStart, onDataChange, onAfterStop: onStop, }: {
        name: string;
        makeObservableQuery: (apolloClient: ApolloClient<object>) => Promise<ObservableQuery<Q>>;
        onAfterInitialized?: (apolloClient: ApolloClient<object>) => void;
        onAfterStart?: (apolloClient: ApolloClient<object>) => void;
        onDataChange: (queryResult: Q | null | undefined) => void;
        onAfterStop?: (apolloClient: ApolloClient<object>) => void;
    });
    initialize(apolloClient: ApolloClient<object>): Promise<void>;
    start(apolloClient: ApolloClient<object>, force?: boolean): void;
    runOnce(apolloClient: ApolloClient<object>): void;
    stop(apolloClient: ApolloClient<object>): void;
    private initiateWatch;
}
