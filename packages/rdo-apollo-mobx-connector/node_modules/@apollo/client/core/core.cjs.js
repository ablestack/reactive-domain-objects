var allExports = require('../apollo-client.cjs');
var names = new Set(["ApolloProvider","ApolloConsumer","getApolloContext","resetApolloContext","useQuery","useLazyQuery","useMutation","useSubscription","useApolloClient","RenderPromises","DocumentType","operationName","parser"]);
Object.keys(allExports).forEach(function (name) {
  if (!names.has(name)) {
    exports[name] = allExports[name];
  }
});
