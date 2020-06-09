import { WatchQueryOptions } from './watchQueryOptions';
import { NetworkStatus } from './networkStatus';
import { ApolloQueryResult } from './types';
import { Observer } from '../utilities/observables/Observable';
import { Concast } from '../utilities/observables/Concast';
export declare class Reobserver<TData, TVars> {
    private observer;
    private options;
    private fetch;
    private shouldFetch;
    constructor(observer: Observer<ApolloQueryResult<TData>>, options: WatchQueryOptions<TVars>, fetch: (options: WatchQueryOptions<TVars>, newNetworkStatus?: NetworkStatus) => Concast<ApolloQueryResult<TData>>, shouldFetch: false | (() => boolean));
    private concast?;
    reobserve(newOptions?: Partial<WatchQueryOptions<TVars>>, newNetworkStatus?: NetworkStatus): Promise<ApolloQueryResult<TData>>;
    updateOptions(newOptions: Partial<WatchQueryOptions<TVars>>): this;
    stop(): void;
    private pollingInfo?;
    private updatePolling;
}
//# sourceMappingURL=Reobserver.d.ts.map