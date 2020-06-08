import { Library, AllCollections, PropNameTestRoot, FooWithNotes } from '.';
import { FooSimple, FooWithCollection, Foo } from './test-source-types';

// -----------------------------------
// FOO - TEST SOURCE MODEL
// -----------------------------------
export const fooSourceJSON: Foo = { id: 'foo-1', name: 'Simple Foo 1' };
export const fooSourceJSONSimple: FooSimple = { bar: { id: 'bar-1', name: 'Bar 1' } };
export const fooSourceJSONWithCollection: FooWithCollection = { collectionOfBar: [{ id: 'bar-1', name: 'Bar 1' }] };

// -----------------------------------
// FOO BAR GRAPH - TEST SOURCE MODEL
// -----------------------------------
export const fooWithNotesSourceJSON: FooWithNotes = {
  id: 'foo-0',
  bar: { id: 'bar-0' },
  arrayOfBar: [{ id: 'bar-1' }],
  mapOfBar: [{ id: 'bar-2' }],
};

// -----------------------------------
// LIBRARY GRAPH - TEST SOURCE MODEL
// -----------------------------------

export const librarySourceJSON: Library = {
  name: 'city-library',
  city: 'niceville',
  capacity: 100,
  code: 'ncl-1',
  authors: [
    {
      id: 'author-js',
      name: 'john smith',
      age: 50,
      books: [
        { id: 'book-js-0', title: 'book 0', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
        { id: 'book-js-1', title: 'book 1', pages: 100, publisher: { id: 'pub-1', name: 'mega-books' }, __type: 'Book' },
        { id: 'book-js-2', title: 'book 2', pages: 200, publisher: { id: 'pub-2', name: 'super-books' }, __type: 'Book' },
        { id: 'book-js-3', title: 'book 3', pages: 200, publisher: { id: 'pub-1', name: 'mega-books' }, __type: 'Book' },
        { id: 'book-js-4', title: 'book 4', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
        { id: 'book-js-5', title: 'book 5', pages: 200, publisher: { id: 'pub-2', name: 'mega-books' }, __type: 'Book' },
        { id: 'book-js-6', title: 'book 6', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
        { id: 'book-js-7', title: 'book 7', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
        { id: 'book-js-8', title: 'book 8', pages: 200, publisher: { id: 'pub-2', name: 'mega-books' }, __type: 'Book' },
        { id: 'book-js-9', title: 'book 9', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
      ],
    },
    {
      id: 'author-jf',
      name: 'jane foo',
      age: 50,
      books: [
        { id: 'book-jf-0', title: 'book 0', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
        { id: 'book-jf-1', title: 'book 1', pages: 100, publisher: { id: 'pub-1', name: 'mega-books' }, __type: 'Book' },
        { id: 'book-jf-2', title: 'book 2', pages: 200, publisher: { id: 'pub-2', name: 'super-books' }, __type: 'Book' },
        { id: 'book-jf-3', title: 'book 3', pages: 200, publisher: { id: 'pub-1', name: 'mega-books' }, __type: 'Book' },
        { id: 'book-jf-4', title: 'book 4', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
        { id: 'book-jf-5', title: 'book 5', pages: 200, publisher: { id: 'pub-2', name: 'mega-books' }, __type: 'Book' },
        { id: 'book-jf-6', title: 'book 6', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
        { id: 'book-jf-7', title: 'book 7', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
        { id: 'book-jf-8', title: 'book 8', pages: 200, publisher: { id: 'pub-2', name: 'mega-books' }, __type: 'Book' },
        { id: 'book-jf-9', title: 'book 9', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
      ],
    },
    {
      id: 'author-ss',
      name: 'shari s',
      age: 50,
      books: [
        { id: 'book-ss-0', title: 'book 0', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
        { id: 'book-ss-1', title: 'book 1', pages: 100, publisher: { id: 'pub-1', name: 'mega-books' }, __type: 'Book' },
        { id: 'book-ss-2', title: 'book 2', pages: 200, publisher: { id: 'pub-2', name: 'super-books' }, __type: 'Book' },
        { id: 'book-ss-3', title: 'book 3', pages: 200, publisher: { id: 'pub-1', name: 'mega-books' }, __type: 'Book' },
        { id: 'book-ss-4', title: 'book 4', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
        { id: 'book-ss-5', title: 'book 5', pages: 200, publisher: { id: 'pub-2', name: 'mega-books' }, __type: 'Book' },
        { id: 'book-ss-6', title: 'book 6', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
        { id: 'book-ss-7', title: 'book 7', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
        { id: 'book-ss-8', title: 'book 8', pages: 200, publisher: { id: 'pub-2', name: 'mega-books' }, __type: 'Book' },
        { id: 'book-ss-9', title: 'book 9', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
      ],
    },
  ],
};

// -----------------------------------
// ALL COLLECTIONS GRAPH - TEST SOURCE MODEL
// -----------------------------------
export const allCollectionsJSON_Trio: AllCollections = {
  arrayOfNumbers: [1, 2, undefined, null, 3],
  arrayOfObjects: [{ id: '1', __type: 'arrayOfObjectsObject' }, { id: '2', __type: 'arrayOfObjectsObject' }, null, undefined, { id: '3', __type: 'arrayOfObjectsObject' }],
  mapOfNumbers: [1, 2, undefined, null, 3],
  mapOfObjects: [{ id: '1', __type: 'arrayOfObjectsObject' }, { id: '2', __type: 'arrayOfObjectsObject' }, null, undefined, { id: '3', __type: 'arrayOfObjectsObject' }],
  setOfNumbers: [1, 2, undefined, null, 3],
  setOfObjects: [{ id: '1', __type: 'arrayOfObjectsObject' }, { id: '2', __type: 'arrayOfObjectsObject' }, null, undefined, { id: '3', __type: 'arrayOfObjectsObject' }],
  customCollectionOfNumbers: [1, 2, undefined, null, 3],
  customCollectionOfObjects: [{ id: '1', __type: 'arrayOfObjectsObject' }, { id: '2', __type: 'arrayOfObjectsObject' }, null, undefined, { id: '3', __type: 'arrayOfObjectsObject' }],
};

// -----------------------------------
// ALL COLLECTIONS GRAPH - TEST SOURCE MODEL
// -----------------------------------
export const allCollectionsJSON_Uno: AllCollections = {
  arrayOfNumbers: [1],
  arrayOfObjects: [{ id: '1', __type: 'arrayOfObjectsObject' }],
  mapOfNumbers: [1],
  mapOfObjects: [{ id: '1', __type: 'mapOfObjectsObject' }],
  setOfNumbers: [1],
  setOfObjects: [{ id: '1', __type: 'setOfObjectsObject' }],
  customCollectionOfNumbers: [1],
  customCollectionOfObjects: [{ id: '1', __type: 'customCollectionOfObjectsObject' }],
};

// -----------------------------------
// LIBRARY GRAPH - PROP NAME TEST MODEL
// -----------------------------------
export const targetedNodeOptionsTestRootJSON: PropNameTestRoot = {
  mapOfDefaultIdDomainModel: [{ id: '1A' }, { id: '1B' }],
  mapOfDefaultId$DomainModel: [{ id: '2A' }, { id: '2B' }],
  mapOfDefault_IdDomainModel: [{ id: '3A' }, { id: '3B' }],
};
