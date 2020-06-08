import React from 'react';
import { ApolloClient, DefaultOptions } from '../../../ApolloClient';
import { ApolloLink } from '../../../link/core/ApolloLink';
import { Resolvers } from '../../../core/types';
import { ApolloCache } from '../../../cache/core/cache';
import { MockedResponse } from '../../../utilities/testing/mocking/mockLink';
export interface MockedProviderProps<TSerializedCache = {}> {
    mocks?: ReadonlyArray<MockedResponse>;
    addTypename?: boolean;
    defaultOptions?: DefaultOptions;
    cache?: ApolloCache<TSerializedCache>;
    resolvers?: Resolvers;
    childProps?: object;
    children?: React.ReactElement;
    link?: ApolloLink;
}
export interface MockedProviderState {
    client: ApolloClient<any>;
}
export declare class MockedProvider extends React.Component<MockedProviderProps, MockedProviderState> {
    static defaultProps: MockedProviderProps;
    constructor(props: MockedProviderProps);
    render(): JSX.Element | null;
    componentWillUnmount(): void;
}
//# sourceMappingURL=MockedProvider.d.ts.map