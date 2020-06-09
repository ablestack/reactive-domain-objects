import { DocumentNode } from 'graphql';
import { ApolloClient } from '../../../ApolloClient';
import { NormalizedCacheObject } from '../../../cache/inmemory/types';
export declare function createMockClient<TData>(data: TData, query: DocumentNode, variables?: {}): ApolloClient<NormalizedCacheObject>;
//# sourceMappingURL=mockClient.d.ts.map