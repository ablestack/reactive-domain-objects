import { GraphSynchronizer, IGraphSyncOptions } from '@ablestack/rdo';
import { Logger } from '@ablestack/rdo/infrastructure/logger';
import { ListMap } from '@ablestack/rdo';
import _ from 'lodash';
import { librarySourceJSON } from '../supporting-files/library-source-data';
import { LibraryRDO, BookRDO } from '../supporting-files/library-rdo-models';
import { Book, Library } from '../supporting-files/library-source-models';

const logger = Logger.make('library-complex-graph-change-sync-performance.test.ts');

const CHANGE_SYNC_ITERATION_COUNT = 5000;
const CHANGE_SYNC_MAX_TIME_MS = 2000;

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

// --------------------------------------------------------------
// CONFIG
// --------------------------------------------------------------
const config: IGraphSyncOptions = {
  targetedNodeOptions: [{ sourceNodeMatcher: { nodePath: 'authors/books' }, makeRdo: (book: Book) => new BookRDO() }],
  globalNodeOptions: { commonRdoFieldnamePostfix: '$' },
};

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------

test(`achieves more than ${CHANGE_SYNC_ITERATION_COUNT} CHANGE synchronizations in ${CHANGE_SYNC_MAX_TIME_MS / 1000} or less, on a medium sized graph`, () => {
  // SETUP
  const iterations = CHANGE_SYNC_ITERATION_COUNT;
  const libraryRDO = new LibraryRDO();
  const graphSynchronizer = new GraphSynchronizer(config);

  // get data for repeatedly editing and syncing
  const libraryWithEditsCollection: Library[] = [];
  for (let i = 0; i < iterations; i++) {
    libraryWithEditsCollection[i] = _.cloneDeep(librarySourceJSON);
    libraryWithEditsCollection[i].authors[2].books[8].pages = i;
  }

  // initial sync
  graphSynchronizer.smartSync({ rootRdo: libraryRDO, rootSourceNode: librarySourceJSON });

  // setup spys to ensure the data is actually being set as expected
  const authors_2_books_7_pages_spy_set = jest.spyOn(libraryRDO.authors.array$[2].books[7], 'pages$', 'set');
  const authors_2_books_8_pages_spy_set = jest.spyOn(libraryRDO.authors.array$[2].books[8], 'pages$', 'set');
  const authors_2_books_9_pages_spy_set = jest.spyOn(libraryRDO.authors.array$[2].books[9], 'pages$', 'set');

  // EXECUTE
  const startTime = performance.now();

  for (let i = 0; i < iterations; i++) {
    graphSynchronizer.smartSync({ rootRdo: libraryRDO, rootSourceNode: libraryWithEditsCollection[i] });
  }

  const finishTime = performance.now();
  const totalTimeMs = Math.round(finishTime - startTime);

  // VERIFY
  logger.info(
    ` Change sync ${iterations} graphSynchronizer.smartSync iterations - TotalTime: ${totalTimeMs} milliseconds (${totalTimeMs / 1000} seconds). Mean average per iteration: ${totalTimeMs / iterations} milliseconds (${
      totalTimeMs / iterations / 1000
    } seconds) `,
  );

  // Verify timing
  expect(totalTimeMs).toBeLessThan(CHANGE_SYNC_MAX_TIME_MS);

  // Verify changes were made as expected (indicating the full sync did actually occur)
  expect(authors_2_books_7_pages_spy_set).not.toHaveBeenCalled();
  expect(authors_2_books_8_pages_spy_set).toHaveBeenCalledTimes(iterations);
  expect(authors_2_books_9_pages_spy_set).not.toHaveBeenCalled();
  expect(libraryRDO.authors.array$[2].books[8].pages$).toEqual(iterations - 1); // -1 because of zero indexing
});
