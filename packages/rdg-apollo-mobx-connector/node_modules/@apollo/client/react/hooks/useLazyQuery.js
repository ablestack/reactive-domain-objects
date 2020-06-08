import { useBaseQuery } from './utils/useBaseQuery.js';

function useLazyQuery(query, options) {
    return useBaseQuery(query, options, true);
}

export { useLazyQuery };
//# sourceMappingURL=useLazyQuery.js.map
