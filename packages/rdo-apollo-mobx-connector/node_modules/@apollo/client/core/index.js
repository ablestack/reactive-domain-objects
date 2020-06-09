export { default as Observable } from 'zen-observable';
import 'symbol-observable';
export { isReference, makeReference } from '../utilities/graphql/storeUtils.js';
export { ApolloLink } from '../link/core/ApolloLink.js';
export { execute } from '../link/core/execute.js';
export { ApolloError, isApolloError } from '../errors/ApolloError.js';
export { NetworkStatus } from './networkStatus.js';
export { ObservableQuery } from './ObservableQuery.js';
export { serializeFetchParameter } from '../link/http/serializeFetchParameter.js';
export { selectURI } from '../link/http/selectURI.js';
export { throwServerError } from '../link/utils/throwServerError.js';
export { parseAndCheckHttpResponse } from '../link/http/parseAndCheckHttpResponse.js';
export { checkFetcher } from '../link/http/checkFetcher.js';
export { fallbackHttpConfig, selectHttpOptionsAndBody } from '../link/http/selectHttpOptionsAndBody.js';
export { createSignalIfSupported } from '../link/http/createSignalIfSupported.js';
export { fromError } from '../link/utils/fromError.js';
export { createHttpLink } from '../link/http/createHttpLink.js';
export { HttpLink } from '../link/http/HttpLink.js';
export { ApolloClient } from '../ApolloClient.js';
export { ApolloCache } from '../cache/core/cache.js';
export { Cache } from '../cache/core/types/Cache.js';
export { MissingFieldError } from '../cache/core/types/common.js';
export { defaultDataIdFromObject } from '../cache/inmemory/policies.js';
export { InMemoryCache } from '../cache/inmemory/inMemoryCache.js';
export { empty } from '../link/core/empty.js';
export { from } from '../link/core/from.js';
export { split } from '../link/core/split.js';
export { concat } from '../link/core/concat.js';
export { toPromise } from '../link/utils/toPromise.js';
export { fromPromise } from '../link/utils/fromPromise.js';
import gql from 'graphql-tag';
export { default as gql } from 'graphql-tag';

var resetCaches = gql.resetCaches, disableFragmentWarnings = gql.disableFragmentWarnings, enableExperimentalFragmentVariables = gql.enableExperimentalFragmentVariables, disableExperimentalFragmentVariables = gql.disableExperimentalFragmentVariables;

export { disableExperimentalFragmentVariables, disableFragmentWarnings, enableExperimentalFragmentVariables, resetCaches };
//# sourceMappingURL=index.js.map
