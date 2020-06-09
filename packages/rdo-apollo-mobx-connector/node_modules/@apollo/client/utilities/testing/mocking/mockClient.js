import { ApolloClient } from '../../../ApolloClient';
import { InMemoryCache } from '../../../cache/inmemory/inMemoryCache';
import { mockSingleLink } from '../../../utilities/testing/mocking/mockLink';
export function createMockClient(data, query, variables) {
    if (variables === void 0) { variables = {}; }
    return new ApolloClient({
        link: mockSingleLink({
            request: { query: query, variables: variables },
            result: { data: data },
        }).setOnError(function (error) { throw error; }),
        cache: new InMemoryCache({ addTypename: false }),
    });
}
//# sourceMappingURL=mockClient.js.map