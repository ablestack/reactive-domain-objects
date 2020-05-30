import { BookDomainModel, LibraryDomainModel, mockWatchedQueryResult } from '.';
import { GraphSynchronizer } from '../src';
import { Logger } from '../src/logger';
import { Book } from './test-types';

const logger = Logger.make('autoSynchronize.test.ts');
const PERF_TEST_ITERATION_COUNT_MS = 1000;
const PERF_TEST_MAX_TIME_MS = 500;

// --------------------------------------------------------------
// TESTS
// --------------------------------------------------------------

test('auto synchronize updates properties as expected', () => {
  const libraryDomainModel = new LibraryDomainModel();

  // SETUP
  const graphSynchronizer = new GraphSynchronizer({
    sourcePathMap: [
      {
        path: 'authors.books',
        options: {
          domainObjectCreation: {
            makeKeyFromSourceElement: (book: Book) => book.id,
            makeKeyFromDomainItem: (book: BookDomainModel) => book.id,
            makeTargetCollectionItemFromSourceItem: (book: Book) => new BookDomainModel(),
          },
        },
      },
    ],
    globalPropertyNameTransformations: { tryStandardPostfix: '$' },
  });

  // POSTURE VERIFICATION
  expect(libraryDomainModel.name).toBeFalsy();
  expect(libraryDomainModel.city$).toBeFalsy();
  expect(libraryDomainModel.authors.size$).toBeFalsy();

  // EXECUTE
  graphSynchronizer.synchronize({ rootDomainObject: libraryDomainModel, rootsourceObject: mockWatchedQueryResult.library });

  // RESULTS VERIFICATION
  expect(libraryDomainModel.name).not.toBeFalsy();
  expect(libraryDomainModel.city$).not.toBeFalsy();
  expect(libraryDomainModel.authors.size$).not.toBeFalsy();

  expect(libraryDomainModel.name).toEqual(mockWatchedQueryResult.library.name);
  expect(libraryDomainModel.city$).toEqual(mockWatchedQueryResult.library.city);

  expect(libraryDomainModel.authors.size$).toEqual(mockWatchedQueryResult.library.authors.length);
  expect(libraryDomainModel.authors.array$[0].id).toEqual(mockWatchedQueryResult.library.authors[0].id);
  expect(libraryDomainModel.authors.array$[0].name$).toEqual(mockWatchedQueryResult.library.authors[0].name);
  expect(libraryDomainModel.authors.array$[0].age$).toEqual(mockWatchedQueryResult.library.authors[0].age);

  expect(libraryDomainModel.authors.array$[0].books.length).toEqual(mockWatchedQueryResult.library.authors[0].books.length);
  expect(libraryDomainModel.authors.array$[0].books[0].id).toEqual(mockWatchedQueryResult.library.authors[0].books[0].id);
  expect(libraryDomainModel.authors.array$[0].books[0].title$).toEqual(mockWatchedQueryResult.library.authors[0].books[0].title);
  expect(libraryDomainModel.authors.array$[0].books[0].publisher).toBeDefined();
  expect(libraryDomainModel.authors.array$[0].books[0].publisher.id).toEqual(mockWatchedQueryResult.library.authors[0].books[0].publisher.id);
  expect(libraryDomainModel.authors.array$[0].books[0].publisher.name$).toEqual(mockWatchedQueryResult.library.authors[0].books[0].publisher.name);
});

//
//
//
test('performance', () => {
  // SETUP
  const iterations = PERF_TEST_ITERATION_COUNT_MS;
  const libraryDomainModel = new LibraryDomainModel();

  const graphSynchronizer = new GraphSynchronizer({
    sourcePathMap: [
      {
        path: 'authors.books',
        options: {
          domainObjectCreation: {
            makeKeyFromSourceElement: (book: Book) => book.id,
            makeKeyFromDomainItem: (book: BookDomainModel) => book.id,
            makeTargetCollectionItemFromSourceItem: (book: Book) => new BookDomainModel(),
          },
        },
      },
    ],
    globalPropertyNameTransformations: { tryStandardPostfix: '$' },
  });

  // EXECUTE
  const startTime = performance.now();

  for (let i = 0; i < iterations; i++) {
    graphSynchronizer.synchronize({ rootDomainObject: libraryDomainModel, rootsourceObject: mockWatchedQueryResult.library });
  }

  const finishTime = performance.now();
  const totalTimeMs = Math.round(finishTime - startTime);

  // VERIFY
  logger.info(
    `${iterations} graphSynchronizer.synchronize iterations: totalTime: ${totalTimeMs} milliseconds (${totalTimeMs / 1000} seconds) = per iteration ${totalTimeMs / iterations} milliseconds (${
      totalTimeMs / iterations / 1000
    } seconds) `,
  );
  expect(totalTimeMs).toBeLessThan(PERF_TEST_MAX_TIME_MS);
});
