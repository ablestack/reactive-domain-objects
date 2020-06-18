import { GraphSynchronizer, IGraphSyncOptions } from '@ablestack/rdo';
import { Logger } from '@ablestack/rdo/infrastructure/logger';
import { LibraryRDO, BookRDO } from './supporting-files/library-rdo-models';
import { librarySourceJSON } from './supporting-files/library-source-data';
import { Book } from './supporting-files/library-source-models';

const logger = Logger.make('flat-object-sync.test.ts');

// -----------------------------------
// Source Data Models
// -----------------------------------

// Imported from ./supporting-files/library-source-models

// -----------------------------------
// Source Data
// -----------------------------------

// Imported from ./supporting-files/library-source-data

// -----------------------------------
// Reactive Domain Object Graph
// -----------------------------------

// Imported from ./supporting-files/library-rdo-models.ts

// --------------------------------------------------------------
// CONFIG
// --------------------------------------------------------------
const config: IGraphSyncOptions = {
  targetedNodeOptions: [{ sourceNodeMatcher: { nodeContent: (node) => node && node.__type === 'Book' }, makeRdo: (book: Book) => new BookRDO() }],
  globalNodeOptions: { commonRdoFieldnamePostfix: '$' },
};

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test('Synchronize using sourceNodeMatcher config', () => {
  const libraryRDO = new LibraryRDO();
  const graphSynchronizer = new GraphSynchronizer(config);

  // POSTURE VERIFICATION
  expect(libraryRDO.authors.size).toBeFalsy();

  // EXECUTE
  graphSynchronizer.smartSync({ rootRdo: libraryRDO, rootSourceNode: librarySourceJSON });

  // RESULTS VERIFICATION
  expect(libraryRDO.authors.array$[0].books.length).toEqual(librarySourceJSON.authors[0].books.length);
  expect(libraryRDO.authors.array$[0].books[0].id).toEqual(librarySourceJSON.authors[0].books[0].id);
});
