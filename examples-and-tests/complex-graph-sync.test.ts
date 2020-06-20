import { GraphSynchronizer, IGraphSyncOptions } from '@ablestack/rdo';
import { Logger } from '@ablestack/rdo/infrastructure/logger';
import { BookRDO, LibraryRDO } from './supporting-files/library-rdo-models';
import { librarySourceJSON } from './supporting-files/library-source-data';
import { Book } from './supporting-files/library-source-models';

const logger = Logger.make('map-sync.test.ts');

// --------------------------------------------------------------
// CONFIG
// --------------------------------------------------------------
const config: IGraphSyncOptions = {
  targetedNodeOptions: [{ sourceNodeMatcher: { nodePath: 'authors.books' }, makeRdo: (book: Book) => new BookRDO() }],
  globalNodeOptions: { commonRdoFieldnamePostfix: '$' },
};

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------

test('Synchronize updates complex graph as expected', () => {
  const libraryRDO = new LibraryRDO();
  const graphSynchronizer = new GraphSynchronizer(config);

  // POSTURE VERIFICATION
  expect(libraryRDO.name).toBeFalsy();
  expect(libraryRDO.city$).toBeFalsy();
  expect(libraryRDO.authors.size).toBeFalsy();

  // EXECUTE
  graphSynchronizer.smartSync({ rootRdo: libraryRDO, rootSourceNode: librarySourceJSON });

  // RESULTS VERIFICATION
  expect(libraryRDO.name).not.toBeFalsy();
  expect(libraryRDO.city$).not.toBeFalsy();
  expect(libraryRDO.authors.size).not.toBeFalsy();

  expect(libraryRDO.name).toEqual(librarySourceJSON.name);
  expect(libraryRDO.city$).toEqual(librarySourceJSON.city);

  expect(libraryRDO.authors.size).toEqual(librarySourceJSON.authors.length);
  expect(libraryRDO.authors.array$[0].id).toEqual(librarySourceJSON.authors[0].id);
  expect(libraryRDO.authors.array$[0].name$).toEqual(librarySourceJSON.authors[0].name);
  expect(libraryRDO.authors.array$[0].age$).toEqual(librarySourceJSON.authors[0].age);

  expect(libraryRDO.authors.array$[0].books.length).toEqual(librarySourceJSON.authors[0].books.length);
  expect(libraryRDO.authors.array$[0].books[0].id).toEqual(librarySourceJSON.authors[0].books[0].id);
  expect(libraryRDO.authors.array$[0].books[0].title$).toEqual(librarySourceJSON.authors[0].books[0].title);
  expect(libraryRDO.authors.array$[0].books[0].publisher).toBeDefined();
  expect(libraryRDO.authors.array$[0].books[0].publisher.id).toEqual(librarySourceJSON.authors[0].books[0].publisher.id);
  expect(libraryRDO.authors.array$[0].books[0].publisher.name$).toEqual(librarySourceJSON.authors[0].books[0].publisher.name);
});

// --------------------------------------------------------------
// MODELS & DATA
// --------------------------------------------------------------

//
// Source Data Models

// Imported from ./supporting-files/library-source-models

//
// Source Data

// Imported from ./supporting-files/library-source-data

//
// RDO Graphs

// Imported from ./supporting-files/library-rdo-models.ts
