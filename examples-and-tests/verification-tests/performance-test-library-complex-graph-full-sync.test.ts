import { GraphSynchronizer, IGraphSyncOptions } from '@ablestack/rdo';
import { Logger } from '@ablestack/rdo/infrastructure/logger';
import _ from 'lodash';
import { BookRDO, LibraryRDO } from '../supporting-files/library-rdo-models';
import { librarySourceJSON } from '../supporting-files/library-source-data';
import { Book } from '../supporting-files/library-source-models';

const logger = Logger.make('library-complex-graph-full-sync-performance.test.ts');

const FULL_SYNC_ITERATION_COUNT = 5000;
const FULL_SYNC_MAX_TIME_MS = 5000;

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

test(`achieves more than ${FULL_SYNC_ITERATION_COUNT} FULL synchronizations in ${FULL_SYNC_MAX_TIME_MS / 1000} or less, on a medium sized graph`, () => {
  // SETUP
  const iterations = FULL_SYNC_ITERATION_COUNT;
  const fieldChangeCounter = new Map<string, number>();
  const targetSourceInstancePath = 'authors/author-ss/books/8';
  const targetSourceKey = 'pages';

  const testArray: { libraryRdo: LibraryRDO; graphSynchronizer: GraphSynchronizer }[] = [];
  for (let i = 0; i < iterations; i++) {
    // Instantiate
    testArray[i] = { libraryRdo: new LibraryRDO(), graphSynchronizer: new GraphSynchronizer(config) };

    // Register
    testArray[i].graphSynchronizer.subscribeToNodeChanges((data) => {
      if (data.sourceNodeInstancePath === targetSourceInstancePath && data.sourceKey === targetSourceKey) {
        if (!fieldChangeCounter.has(data.sourceKey)) fieldChangeCounter.set(data.sourceKey, 0);
        fieldChangeCounter.set(data.sourceKey, fieldChangeCounter.get(data.sourceKey)! + 1);
      }
    });
  }

  // EXECUTE
  const startTime = performance.now();

  // Loop n sync
  for (let i = 0; i < iterations; i++) {
    testArray[i].graphSynchronizer.smartSync({ rootRdo: testArray[i].libraryRdo, rootSourceNode: librarySourceJSON });
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
  expect(fieldChangeCounter.get(targetSourceKey)).toEqual(iterations);
  expect(testArray[iterations - 1].libraryRdo.authors.array$[2].books[8].pages$).toEqual(librarySourceJSON.authors[2].books[8].pages);
});
