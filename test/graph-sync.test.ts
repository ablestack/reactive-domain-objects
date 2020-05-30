import { BookDomainModel, LibraryDomainModel, mockWatchedQueryResult } from '.';
import { GraphSynchronizer } from '../src';
import { Logger } from '../src/logger';
import { Book } from './test-types';
import _ from 'lodash';

const logger = Logger.make('autoSynchronize.test.ts');
const PERF_TEST_ITERATION_COUNT_MS = 1000;
const PERF_TEST_MAX_TIME_MS = 500;

// --------------------------------------------------------------
// SHARED
// --------------------------------------------------------------
function makePreconfiguredGraphSynchronizer() {
  // SETUP
  return new GraphSynchronizer({
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
}

// --------------------------------------------------------------
// TESTS
// --------------------------------------------------------------

test('auto synchronize updates properties as expected', () => {
  const libraryDomainModel = new LibraryDomainModel();
  const graphSynchronizer = makePreconfiguredGraphSynchronizer();

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
test('achieves more than 500 full synchronizations a second on a medium sized graph', () => {
  // SETUP
  const iterations = PERF_TEST_ITERATION_COUNT_MS;
  const libraryDomainModel = new LibraryDomainModel();
  const graphSynchronizer = makePreconfiguredGraphSynchronizer();

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

test.only('auto synchronize only updated properties where source data changed', () => {
  const libraryDomainModel = new LibraryDomainModel();
  const graphSynchronizer = makePreconfiguredGraphSynchronizer();

  // Initial data load
  graphSynchronizer.synchronize({ rootDomainObject: libraryDomainModel, rootsourceObject: mockWatchedQueryResult.library });
  console.log(' --------------------------------------------------------------------------------------------------------- ');

  // Add method spies
  // const library_code_spy = jest.spyOn(libraryDomainModel, 'code$', 'set');
  // const library_capacity_spy = jest.spyOn(libraryDomainModel, 'capacity', 'set');

  // const authors_0_age_spy = jest.spyOn(libraryDomainModel.authors.array$[0], 'age$', 'set');
  // const authors_0_name_spy = jest.spyOn(libraryDomainModel.authors.array$[0], 'name$', 'set');

  // Mutate data
  const libraryWithEdits = _.cloneDeep(mockWatchedQueryResult.library);
  libraryWithEdits.code = libraryWithEdits.code + ' - changed';
  libraryWithEdits.authors[0].age = libraryWithEdits.authors[0].age + 2;

  // EXECUTE
  // update
  graphSynchronizer.synchronize({ rootDomainObject: libraryDomainModel, rootsourceObject: libraryWithEdits });

  // RESULTS VERIFICATION
  // expect(library_code_spy).toHaveBeenCalled();
  // expect(library_capacity_spy).not.toHaveBeenCalled();

  // expect(authors_0_age_spy).toHaveBeenCalled();
  // expect(authors_0_name_spy).not.toHaveBeenCalled();
});
