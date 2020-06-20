import { GraphSynchronizer, IGraphSyncOptions } from '@ablestack/rdo';
import { Logger } from '@ablestack/rdo/infrastructure/logger';
import _ from 'lodash';

const logger = Logger.make('map-sync.test.ts');

// --------------------------------------------------------------
// CONFIG
// --------------------------------------------------------------
const config: IGraphSyncOptions = {
  globalNodeOptions: {
    autoMakeRdoTypes: {
      as: 'mobx-observable-object-literals', // Can choose for Rdo to be auto-made as mobx-observable decorated object literals, or plain literal objects
      collectionElements: true,
      objectFields: true,
    },
  },
};

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------

test('Synchronize auto-creates RDO and updates complex graph as expected', () => {
  //
  // NOTE - the RDO object here starts as an empty object literal. Due to the `autoMakeRdoTypes` setting, the Rdo is auto-created.
  //  Every field is initially populated, and then (as with manually created graphs) only changed fields are subsequently updated
  //
  const libraryRDO = {} as Library;

  //
  const graphSynchronizer = new GraphSynchronizer(config);
  graphSynchronizer.subscribeToNodeChanges((data) => {});

  // POSTURE VERIFICATION
  expect(libraryRDO.name).toBeFalsy();
  expect(libraryRDO.city).toBeFalsy();
  expect(libraryRDO.authors).toBeFalsy();

  // EXECUTE
  graphSynchronizer.smartSync({ rootRdo: libraryRDO, rootSourceNode: librarySourceJSON });

  // RESULTS VERIFICATION
  expect(libraryRDO.name).not.toBeFalsy();
  expect(libraryRDO.city).not.toBeFalsy();
  expect(libraryRDO.authors.length).not.toBeFalsy();

  expect(libraryRDO.name).toEqual(librarySourceJSON.name);
  expect(libraryRDO.city).toEqual(librarySourceJSON.city);

  expect(libraryRDO.authors[0].id).toEqual(librarySourceJSON.authors[0].id);
  expect(libraryRDO.authors[0].name).toEqual(librarySourceJSON.authors[0].name);
  expect(libraryRDO.authors[0].age).toEqual(librarySourceJSON.authors[0].age);

  expect(libraryRDO.authors[0].books.length).toEqual(librarySourceJSON.authors[0].books.length);
  expect(libraryRDO.authors[0].books[0].id).toEqual(librarySourceJSON.authors[0].books[0].id);
  expect(libraryRDO.authors[0].books[0].title).toEqual(librarySourceJSON.authors[0].books[0].title);
  expect(libraryRDO.authors[0].books[0].publisher).toBeDefined();
  expect(libraryRDO.authors[0].books[0].publisher.id).toEqual(librarySourceJSON.authors[0].books[0].publisher.id);
  expect(libraryRDO.authors[0].books[0].publisher.name).toEqual(librarySourceJSON.authors[0].books[0].publisher.name);
});
// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------

test('Synchronize only updated properties only where source data changed', () => {
  const libraryRDO = {} as Library;
  const graphSynchronizer = new GraphSynchronizer(config);

  // Initial data load
  graphSynchronizer.smartSync({ rootRdo: libraryRDO, rootSourceNode: librarySourceJSON });

  // register with eventEmitter
  const fieldChangeCounter = new Map<string, number>();
  graphSynchronizer.subscribeToNodeChanges((data) => {
    if (!fieldChangeCounter.has(data.rdoKey)) fieldChangeCounter.set(data.rdoKey, 0);
    fieldChangeCounter.set(data.rdoKey, fieldChangeCounter.get(data.rdoKey)! + 1);
  });

  // Mutate data
  const libraryWithEdits = _.cloneDeep(librarySourceJSON);
  libraryWithEdits.code = libraryWithEdits.code + ' - changed';
  libraryWithEdits.authors[0].age = libraryWithEdits.authors[0].age + 2;

  // EXECUTE
  graphSynchronizer.smartSync({ rootRdo: libraryRDO, rootSourceNode: libraryWithEdits });

  // RESULTS VERIFICATION
  expect(fieldChangeCounter.get('code')).toEqual(1);
  expect(fieldChangeCounter.has('capacity')).toBeFalsy();

  expect(fieldChangeCounter.get('age')).toEqual(1);
  expect(fieldChangeCounter.has('name')).toBeFalsy();
  expect(fieldChangeCounter.has('title')).toBeFalsy();
});

// --------------------------------------------------------------
// MODELS & DATA
// --------------------------------------------------------------

//
// Source Data Models
type Publisher = { id: string; name: string };
type Book = { id: string; title: string; pages: number; publisher: Publisher; __type: string };
type Author = { id: string; name: string; age: number; books: Book[] };
type Library = { name: string; city: string; capacity: number; code: string; authors: Author[] };

//
// Source Data

const librarySourceJSON: Library = {
  name: 'city-library',
  city: 'niceville',
  capacity: 100,
  code: 'ncl-1',
  authors: [
    {
      id: 'author-js',
      name: 'john smith',
      age: 30,
      books: [
        { id: 'book-js-0', title: 'book 0', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
        { id: 'book-js-1', title: 'book 1', pages: 100, publisher: { id: 'pub-1', name: 'mega-books' }, __type: 'Book' },
      ],
    },
    {
      id: 'author-jf',
      name: 'jane foo',
      age: 50,
      books: [{ id: 'book-jf-0', title: 'book 0', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' }],
    },
    {
      id: 'author-ss',
      name: 'shari s',
      age: 40,
      books: [{ id: 'book-ss-0', title: 'book 0', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' }],
    },
  ],
};

//
// RDO Graphs

// Auto Generated
