import { BookDomainModel, LibraryDomainModel, mockWatchedLibraryGraphQueryResult, AllCollectionTypesWithObjectsDomainModel, mockWatchedAllCollectionsQueryResult } from '.';
import { GraphSynchronizer } from '../src';
import { Logger } from '../src/logger';
import { Book, SimpleObject } from './test-types';
import _ from 'lodash';
import { SimpleObjectDomainModel, AllCollectionTypesWithPrimitivesDomainModel } from './test-domain-models';

const logger = Logger.make('autoSynchronize.test.ts');
const PERF_TEST_ITERATION_COUNT_MS = 1000;
const PERF_TEST_MAX_TIME_MS = 500;

// --------------------------------------------------------------
// SHARED
// --------------------------------------------------------------
function makePreconfiguredLibraryGraphSynchronizer() {
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
// TEST
// --------------------------------------------------------------

test('auto synchronize updates complex domain graph as expected', () => {
  const libraryDomainModel = new LibraryDomainModel();
  const graphSynchronizer = makePreconfiguredLibraryGraphSynchronizer();

  // POSTURE VERIFICATION
  expect(libraryDomainModel.name).toBeFalsy();
  expect(libraryDomainModel.city$).toBeFalsy();
  expect(libraryDomainModel.authors.size$).toBeFalsy();

  // EXECUTE
  graphSynchronizer.synchronize({ rootDomainObject: libraryDomainModel, rootsourceObject: mockWatchedLibraryGraphQueryResult.library });

  // RESULTS VERIFICATION
  expect(libraryDomainModel.name).not.toBeFalsy();
  expect(libraryDomainModel.city$).not.toBeFalsy();
  expect(libraryDomainModel.authors.size$).not.toBeFalsy();

  expect(libraryDomainModel.name).toEqual(mockWatchedLibraryGraphQueryResult.library.name);
  expect(libraryDomainModel.city$).toEqual(mockWatchedLibraryGraphQueryResult.library.city);

  expect(libraryDomainModel.authors.size$).toEqual(mockWatchedLibraryGraphQueryResult.library.authors.length);
  expect(libraryDomainModel.authors.array$[0].id).toEqual(mockWatchedLibraryGraphQueryResult.library.authors[0].id);
  expect(libraryDomainModel.authors.array$[0].name$).toEqual(mockWatchedLibraryGraphQueryResult.library.authors[0].name);
  expect(libraryDomainModel.authors.array$[0].age$).toEqual(mockWatchedLibraryGraphQueryResult.library.authors[0].age);

  expect(libraryDomainModel.authors.array$[0].books.length).toEqual(mockWatchedLibraryGraphQueryResult.library.authors[0].books.length);
  expect(libraryDomainModel.authors.array$[0].books[0].id).toEqual(mockWatchedLibraryGraphQueryResult.library.authors[0].books[0].id);
  expect(libraryDomainModel.authors.array$[0].books[0].title$).toEqual(mockWatchedLibraryGraphQueryResult.library.authors[0].books[0].title);
  expect(libraryDomainModel.authors.array$[0].books[0].publisher).toBeDefined();
  expect(libraryDomainModel.authors.array$[0].books[0].publisher.id).toEqual(mockWatchedLibraryGraphQueryResult.library.authors[0].books[0].publisher.id);
  expect(libraryDomainModel.authors.array$[0].books[0].publisher.name$).toEqual(mockWatchedLibraryGraphQueryResult.library.authors[0].books[0].publisher.name);
});

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test('achieves more than 500 full synchronizations a second on a medium sized graph', () => {
  // SETUP
  const iterations = PERF_TEST_ITERATION_COUNT_MS;
  const libraryDomainModel = new LibraryDomainModel();
  const graphSynchronizer = makePreconfiguredLibraryGraphSynchronizer();

  // EXECUTE
  const startTime = performance.now();

  for (let i = 0; i < iterations; i++) {
    graphSynchronizer.synchronize({ rootDomainObject: libraryDomainModel, rootsourceObject: mockWatchedLibraryGraphQueryResult.library });
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

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test('auto synchronize only updated properties where source data changed', () => {
  const libraryDomainModel = new LibraryDomainModel();
  const graphSynchronizer = makePreconfiguredLibraryGraphSynchronizer();

  // Initial data load
  graphSynchronizer.synchronize({ rootDomainObject: libraryDomainModel, rootsourceObject: mockWatchedLibraryGraphQueryResult.library });

  // Add method spies
  const library_code_spy = jest.spyOn(libraryDomainModel, 'code$', 'set');
  const library_capacity_spy = jest.spyOn(libraryDomainModel, 'capacity', 'set');

  const authors_0_age_spy = jest.spyOn(libraryDomainModel.authors.array$[0], 'age$', 'set');
  const authors_0_name_spy = jest.spyOn(libraryDomainModel.authors.array$[0], 'name$', 'set');

  // Mutate data
  const libraryWithEdits = _.cloneDeep(mockWatchedLibraryGraphQueryResult.library);
  libraryWithEdits.code = libraryWithEdits.code + ' - changed';
  libraryWithEdits.authors[0].age = libraryWithEdits.authors[0].age + 2;

  // EXECUTE
  // update
  graphSynchronizer.synchronize({ rootDomainObject: libraryDomainModel, rootsourceObject: libraryWithEdits });

  // RESULTS VERIFICATION
  expect(library_code_spy).toHaveBeenCalled();
  expect(library_capacity_spy).not.toHaveBeenCalled();

  expect(authors_0_age_spy).toHaveBeenCalled();
  expect(authors_0_name_spy).not.toHaveBeenCalled();
});

// --------------------------------------------------------------
// SHARED
// --------------------------------------------------------------
function makePreconfiguredAllCollectionTypesGraphSynchronizer() {
  // SETUP
  return new GraphSynchronizer({
    sourcePathMap: [
      {
        path: 'arrayOfObjects',
        options: {
          domainObjectCreation: {
            makeKeyFromSourceElement: (o: SimpleObject) => o.id,
            makeKeyFromDomainItem: (o: SimpleObjectDomainModel) => o.id,
            makeTargetCollectionItemFromSourceItem: (o: SimpleObject) => new SimpleObjectDomainModel(),
          },
        },
      },
      {
        path: 'mapOfObjects',
        options: {
          domainObjectCreation: {
            makeKeyFromSourceElement: (o: SimpleObject) => o.id,
            makeKeyFromDomainItem: (o: SimpleObjectDomainModel) => o.id,
            makeTargetCollectionItemFromSourceItem: (o: SimpleObject) => new SimpleObjectDomainModel(),
          },
        },
      },
      {
        path: 'setOfObjects',
        options: {
          domainObjectCreation: {
            makeKeyFromSourceElement: (o: SimpleObject) => o.id,
            makeKeyFromDomainItem: (o: SimpleObjectDomainModel) => o.id,
            makeTargetCollectionItemFromSourceItem: (o: SimpleObject) => new SimpleObjectDomainModel(),
          },
        },
      },
      {
        path: 'customCollectionOfObjects',
        options: {
          domainObjectCreation: {
            makeKeyFromSourceElement: (o: SimpleObject) => o.id,
            makeKeyFromDomainItem: (o: SimpleObjectDomainModel) => o.id,
            makeTargetCollectionItemFromSourceItem: (o: SimpleObject) => new SimpleObjectDomainModel(),
          },
        },
      },
    ],
    globalPropertyNameTransformations: { tryStandardPostfix: '$' },
  });
}

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test('auto synchronize all object collection types', () => {
  const allCollectionTypesDomainModel = new AllCollectionTypesWithObjectsDomainModel();
  const graphSynchronizer = makePreconfiguredAllCollectionTypesGraphSynchronizer();

  // POSTURE VERIFICATION
  expect(allCollectionTypesDomainModel.arrayOfObjects.length).toEqual(0);
  expect(allCollectionTypesDomainModel.mapOfObjects.size).toEqual(0);
  expect(allCollectionTypesDomainModel.setOfObjects.size).toEqual(0);
  expect(allCollectionTypesDomainModel.customCollectionOfObjects.size$).toEqual(0);

  // EXECUTE
  graphSynchronizer.synchronize({ rootDomainObject: allCollectionTypesDomainModel, rootsourceObject: mockWatchedAllCollectionsQueryResult.data });

  // RESULTS VERIFICATION
  expect(allCollectionTypesDomainModel.arrayOfObjects.length).toEqual(3);
  expect(allCollectionTypesDomainModel.mapOfObjects.size).toEqual(3);
  expect(allCollectionTypesDomainModel.setOfObjects.size).toEqual(3);
  expect(allCollectionTypesDomainModel.customCollectionOfObjects.size$).toEqual(3);
});

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test('auto synchronize all primitive collection types', () => {
  const allCollectionTypesDomainModel = new AllCollectionTypesWithPrimitivesDomainModel();
  const graphSynchronizer = makePreconfiguredAllCollectionTypesGraphSynchronizer();

  // POSTURE VERIFICATION
  expect(allCollectionTypesDomainModel.arrayOfNumbers.length).toEqual(0);
  expect(allCollectionTypesDomainModel.mapOfNumbers.size).toEqual(0);
  expect(allCollectionTypesDomainModel.setOfNumbers.size).toEqual(0);

  // EXECUTE
  graphSynchronizer.synchronize({ rootDomainObject: allCollectionTypesDomainModel, rootsourceObject: mockWatchedAllCollectionsQueryResult.data });

  // RESULTS VERIFICATION
  expect(allCollectionTypesDomainModel.arrayOfNumbers.length).toEqual(3);
  expect(allCollectionTypesDomainModel.mapOfNumbers.size).toEqual(3);
  expect(allCollectionTypesDomainModel.setOfNumbers.size).toEqual(3);
});

// Undefined /null values test
// Add collection items
// Remove Collection items
