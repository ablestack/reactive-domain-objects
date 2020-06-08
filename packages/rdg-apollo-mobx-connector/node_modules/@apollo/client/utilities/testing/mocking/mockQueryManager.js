import { QueryManager } from '../../../core/QueryManager';
import { mockSingleLink } from './mockLink';
import { InMemoryCache } from '../../../cache/inmemory/inMemoryCache';
export default (function (reject) {
    var mockedResponses = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        mockedResponses[_i - 1] = arguments[_i];
    }
    return new QueryManager({
        link: mockSingleLink.apply(void 0, mockedResponses).setOnError(reject),
        cache: new InMemoryCache({ addTypename: false }),
    });
});
//# sourceMappingURL=mockQueryManager.js.map