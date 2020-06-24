import { GraphSynchronizer, IGraphSyncOptions } from '@ablestack/rdo';
import { Logger } from '@ablestack/rdo/infrastructure/logger';
import _ from 'lodash';
import { BookRDO, LibraryRDO } from '../supporting-files/library-rdo-models';
import { librarySourceJSON } from '../supporting-files/library-source-data';
import { Book } from '../supporting-files/library-source-models';

const logger = Logger.make('library-complex-graph-full-sync-performance.test.ts');

const FULL_SYNC_ITERATION_COUNT = 500;
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
  const fieldChangeCounter = new Map<string, number>();
  const targetBookPath = 'authors/2/books/8/pages';

  const graphSyncronizerArray: GraphSynchronizer[] = [];
  for (let i = 0; i < iterations; i++) {
    // Instantiate
    graphSyncronizerArray[i] = new GraphSynchronizer(config);
    // Tegister
    graphSyncronizerArray[i].subscribeToNodeChanges((data) => {
      if (data.sourceNodePath === targetBookPath) {
        if (data.sourceNodePath) if (!fieldChangeCounter.has(data.rdoKey)) fieldChangeCounter.set(data.rdoKey, 0);
        fieldChangeCounter.set(data.rdoKey, fieldChangeCounter.get(data.rdoKey)! + 1);
      }
    });
  }

  // EXECUTE
  const startTime = performance.now();

  // Loop n sync
  for (let i = 0; i < iterations; i++) {
    graphSyncronizerArray[i].smartSync({ rootRdo: libraryRDO, rootSourceNode: librarySourceJSON });
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
  expect(fieldChangeCounter.get(targetBookPath)).toHaveBeenCalledTimes(iterations);
  expect(libraryRDO.authors.array$[2].books[8].pages$).toEqual(librarySourceJSON.authors[2].books[8].pages);
});
