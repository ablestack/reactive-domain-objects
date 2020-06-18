import { GraphSynchronizer, IGraphSyncOptions } from '@ablestack/rdo';
import { Logger } from '@ablestack/rdo/infrastructure/logger';
import _ from 'lodash';
import { BookRDO, LibraryRDO } from './supporting-files/library-rdo-models';
import { librarySourceJSON } from './supporting-files/library-source-data';
import { Book } from './supporting-files/library-source-models';

const logger = Logger.make('library-complex-graph-full-sync-performance.test.ts');

const FULL_SYNC_ITERATION_COUNT = 500;
const FULL_SYNC_MAX_TIME_MS = 5000;

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
  targetedNodeOptions: [{ sourceNodeMatcher: { nodePath: 'authors.books' }, makeRdo: (book: Book) => new BookRDO() }],
  globalNodeOptions: { commonRdoFieldnamePostfix: '$' },
};

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------

test(`achieves more than ${FULL_SYNC_ITERATION_COUNT} FULL synchronizations in ${FULL_SYNC_MAX_TIME_MS / 1000} or less, on a medium sized graph`, () => {
  // SETUP
  const iterations = FULL_SYNC_ITERATION_COUNT;
  const libraryRDO = new LibraryRDO();
  const graphSynchronizer = new GraphSynchronizer(config);

  // initiate a smart sync
  graphSynchronizer.smartSync({ rootRdo: libraryRDO, rootSourceNode: librarySourceJSON });

  // setup spys to ensure the data is actually being set as expected
  const authors_2_books_7_pages_spy_set = jest.spyOn(libraryRDO.authors.array$[2].books[7], 'pages$', 'set');
  const authors_2_books_8_pages_spy_set = jest.spyOn(libraryRDO.authors.array$[2].books[8], 'pages$', 'set');
  const authors_2_books_9_pages_spy_set = jest.spyOn(libraryRDO.authors.array$[2].books[9], 'pages$', 'set');

  // clone library for edits
  const libraryWithEdits = _.cloneDeep(librarySourceJSON);

  // EXECUTE
  const startTime = performance.now();

  for (let i = 0; i < iterations; i++) {
    // clear the tracked data
    graphSynchronizer.clearTrackedData();

    // change some values to get around the source -> domain value check for primitive types, allowing the spying on the set methods to be hit
    libraryWithEdits.authors[2].books[7].pages = i;
    libraryWithEdits.authors[2].books[8].pages = i;
    libraryWithEdits.authors[2].books[9].pages = i;

    // initiate a smart sync
    graphSynchronizer.smartSync({ rootRdo: libraryRDO, rootSourceNode: libraryWithEdits });
  }

  const finishTime = performance.now();
  const totalTimeMs = Math.round(finishTime - startTime);

  // VERIFY
  logger.info(
    `Full Sync ${iterations} graphSynchronizer.smartSync iterations - TotalTime: ${totalTimeMs} milliseconds (${totalTimeMs / 1000} seconds). Mean average per iteration: ${totalTimeMs / iterations} milliseconds (${
      totalTimeMs / iterations / 1000
    } seconds) `,
  );

  // Verify timing
  expect(totalTimeMs).toBeLessThan(FULL_SYNC_MAX_TIME_MS);

  // Verify changes were made as expected (indicating the full sync did actually occur)
  expect(authors_2_books_7_pages_spy_set).toHaveBeenCalledTimes(iterations);
  expect(authors_2_books_8_pages_spy_set).toHaveBeenCalledTimes(iterations);
  expect(authors_2_books_9_pages_spy_set).toHaveBeenCalledTimes(iterations);
  expect(libraryRDO.authors.array$[2].books[8].pages$).toEqual(libraryWithEdits.authors[2].books[8].pages);
});
