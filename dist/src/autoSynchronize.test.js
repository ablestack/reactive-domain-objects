"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mobx_1 = require("mobx");
const _1 = require(".");
// Define Test Source Data Graph
const mockWatchedQueryResult = {
    author: {
        id: 'author-1',
        name: 'john smith',
        age: 50,
        books: [
            { id: 'book-1', title: 'book 1', pages: 100, publisher: { id: 'pub-1', name: 'mega-books' } },
            { id: 'book-2', title: 'book 2', pages: 200, publisher: { id: 'pub-1', name: 'super-books' } },
        ],
    },
};
// Define Test Domain Model objects
let PublisherDM = /** @class */ (() => {
    class PublisherDM {
    }
    tslib_1.__decorate([
        mobx_1.observable,
        tslib_1.__metadata("design:type", String)
    ], PublisherDM.prototype, "id", void 0);
    tslib_1.__decorate([
        mobx_1.observable,
        tslib_1.__metadata("design:type", String)
    ], PublisherDM.prototype, "name", void 0);
    return PublisherDM;
})();
let BookDM = /** @class */ (() => {
    class BookDM {
    }
    tslib_1.__decorate([
        mobx_1.observable,
        tslib_1.__metadata("design:type", String)
    ], BookDM.prototype, "id", void 0);
    tslib_1.__decorate([
        mobx_1.observable,
        tslib_1.__metadata("design:type", String)
    ], BookDM.prototype, "title", void 0);
    tslib_1.__decorate([
        mobx_1.observable,
        tslib_1.__metadata("design:type", Number)
    ], BookDM.prototype, "pages", void 0);
    tslib_1.__decorate([
        mobx_1.observable,
        tslib_1.__metadata("design:type", PublisherDM)
    ], BookDM.prototype, "publisher", void 0);
    return BookDM;
})();
let AuthorDM = /** @class */ (() => {
    class AuthorDM {
    }
    tslib_1.__decorate([
        mobx_1.observable,
        tslib_1.__metadata("design:type", String)
    ], AuthorDM.prototype, "id$", void 0);
    tslib_1.__decorate([
        mobx_1.observable,
        tslib_1.__metadata("design:type", String)
    ], AuthorDM.prototype, "name$", void 0);
    tslib_1.__decorate([
        mobx_1.observable,
        tslib_1.__metadata("design:type", Number)
    ], AuthorDM.prototype, "age$", void 0);
    return AuthorDM;
})();
test('auto synchronize updates properties as expected', () => {
    const authorDM = new AuthorDM();
    expect(authorDM.id$).toBeUndefined();
    _1.SyncUtils.autoSynchronize({ rootSourceData: mockWatchedQueryResult.author, rootSyncableObject: authorDM });
    expect(authorDM.id$).toEqual(mockWatchedQueryResult.author.id);
});
//# sourceMappingURL=autoSynchronize.test.js.map