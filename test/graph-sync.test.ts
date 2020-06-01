import { BookDomainModel, LibraryDomainModel, mockWatchedLibraryGraphQueryResult, AllCollectionTypesWithObjectsDomainModel, mockWatchedAllCollectionsQueryResult_Trio, mockWatchedAllCollectionsQueryResult_Uno } from '.';
import { GraphSynchronizer } from '../src';
import { Logger } from '../src/logger';
import { Book, SimpleObject } from './test-types';
import _ from 'lodash';
import { SimpleObjectDomainModel, AllCollectionTypesWithPrimitivesDomainModel, AllCollectionTypesDomainModel } from './test-domain-models';

const logger = Logger.make('autoSynchronize.test.ts');
const PERF_TEST_ITERATION_COUNT_MS = 1000;
const PERF_TEST_MAX_TIME_MS = 500;

// --------------------------------------------------------------
// SHARED
// --------------------------------------------------------------
function makePreconfiguredLibraryGraphSynchronizerUsingPathOptions() {
  // SETUP
  return new GraphSynchronizer({
    targetedOptions: [
      {
        selector: { path: 'authors.books' },

        domainModelCreation: {
          makeKeyFromSourceNode: (book: Book) => book.id,
          makeKeyFromDomainNode: (book: BookDomainModel) => book.id,
          makeDomainModel: (book: Book) => new BookDomainModel(),
        },
      },
    ],
    globalOptions: { tryStandardPostfix: '$' },
  });
}

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------

test('Synchronize updates complex domain graph as expected', () => {
  const libraryDomainModel = new LibraryDomainModel();
  const graphSynchronizer = makePreconfiguredLibraryGraphSynchronizerUsingPathOptions();

  // POSTURE VERIFICATION
  expect(libraryDomainModel.name).toBeFalsy();
  expect(libraryDomainModel.city$).toBeFalsy();
  expect(libraryDomainModel.authors.size).toBeFalsy();

  // EXECUTE
  graphSynchronizer.synchronize({ rootDomainModel: libraryDomainModel, rootsourceObject: mockWatchedLibraryGraphQueryResult.library });

  // RESULTS VERIFICATION
  expect(libraryDomainModel.name).not.toBeFalsy();
  expect(libraryDomainModel.city$).not.toBeFalsy();
  expect(libraryDomainModel.authors.size).not.toBeFalsy();

  expect(libraryDomainModel.name).toEqual(mockWatchedLibraryGraphQueryResult.library.name);
  expect(libraryDomainModel.city$).toEqual(mockWatchedLibraryGraphQueryResult.library.city);

  expect(libraryDomainModel.authors.size).toEqual(mockWatchedLibraryGraphQueryResult.library.authors.length);
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
  const graphSynchronizer = makePreconfiguredLibraryGraphSynchronizerUsingPathOptions();

  // EXECUTE
  const startTime = performance.now();

  for (let i = 0; i < iterations; i++) {
    graphSynchronizer.synchronize({ rootDomainModel: libraryDomainModel, rootsourceObject: mockWatchedLibraryGraphQueryResult.library });
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
test('Synchronize only updated properties where source data changed', () => {
  const libraryDomainModel = new LibraryDomainModel();
  const graphSynchronizer = makePreconfiguredLibraryGraphSynchronizerUsingPathOptions();

  // Initial data load
  graphSynchronizer.synchronize({ rootDomainModel: libraryDomainModel, rootsourceObject: mockWatchedLibraryGraphQueryResult.library });

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
  graphSynchronizer.synchronize({ rootDomainModel: libraryDomainModel, rootsourceObject: libraryWithEdits });

  // RESULTS VERIFICATION
  expect(library_code_spy).toHaveBeenCalled();
  expect(library_capacity_spy).not.toHaveBeenCalled();

  expect(authors_0_age_spy).toHaveBeenCalled();
  expect(authors_0_name_spy).not.toHaveBeenCalled();
});

// --------------------------------------------------------------
// SHARED
// --------------------------------------------------------------
function makePreconfiguredLibraryGraphSynchronizerUsingTypeOptions() {
  // SETUP
  return new GraphSynchronizer({
    targetedOptions: [
      {
        selector: { matcher: (node) => node && node.__type === 'Book' },
        domainModelCreation: {
          makeKeyFromSourceNode: (book: Book) => book.id,
          makeKeyFromDomainNode: (book: BookDomainModel) => book.id,
          makeDomainModel: (book: Book) => new BookDomainModel(),
        },
      },
    ],
    globalOptions: { tryStandardPostfix: '$' },
  });
}

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test('Synchronize using selector config', () => {
  const libraryDomainModel = new LibraryDomainModel();
  const graphSynchronizer = makePreconfiguredLibraryGraphSynchronizerUsingTypeOptions();

  // POSTURE VERIFICATION
  expect(libraryDomainModel.authors.size).toBeFalsy();

  // EXECUTE
  graphSynchronizer.synchronize({ rootDomainModel: libraryDomainModel, rootsourceObject: mockWatchedLibraryGraphQueryResult.library });

  // RESULTS VERIFICATION
  expect(libraryDomainModel.authors.array$[0].books.length).toEqual(mockWatchedLibraryGraphQueryResult.library.authors[0].books.length);
  expect(libraryDomainModel.authors.array$[0].books[0].id).toEqual(mockWatchedLibraryGraphQueryResult.library.authors[0].books[0].id);
});

// --------------------------------------------------------------
// SHARED
// --------------------------------------------------------------
function makePreconfiguredAllCollectionTypesGraphSynchronizer() {
  // SETUP
  return new GraphSynchronizer({
    targetedOptions: [
      {
        selector: { matcher: (sourceNode) => sourceNode && sourceNode.__type === 'arrayOfObjectsObject' },
        domainModelCreation: {
          makeKeyFromSourceNode: (o: SimpleObject) => o.id,
          makeKeyFromDomainNode: (o: SimpleObjectDomainModel) => o.id,
          makeDomainModel: (o: SimpleObject) => new SimpleObjectDomainModel(),
        },
      },
      {
        selector: { matcher: (sourceNode) => sourceNode && sourceNode.__type === 'mapOfObjectsObject' },
        domainModelCreation: {
          makeKeyFromSourceNode: (o: SimpleObject) => o.id,
          makeKeyFromDomainNode: (o: SimpleObjectDomainModel) => o.id,
          makeDomainModel: (o: SimpleObject) => new SimpleObjectDomainModel(),
        },
      },
      {
        selector: { matcher: (sourceNode) => sourceNode && sourceNode.__type === 'setOfObjectsObject' },
        domainModelCreation: {
          makeKeyFromSourceNode: (o: SimpleObject) => o.id,
          makeKeyFromDomainNode: (o: SimpleObjectDomainModel) => o.id,
          makeDomainModel: (o: SimpleObject) => new SimpleObjectDomainModel(),
        },
      },
      {
        selector: { matcher: (sourceNode) => sourceNode && sourceNode.__type === 'customCollectinOfObjectsObject' },
        domainModelCreation: {
          makeKeyFromSourceNode: (o: SimpleObject) => o.id,
          makeKeyFromDomainNode: (o: SimpleObjectDomainModel) => o.id,
          makeDomainModel: (o: SimpleObject) => new SimpleObjectDomainModel(),
        },
      },
    ],
    globalOptions: { tryStandardPostfix: '$' },
  });
}

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test('Synchronize all object collection types', () => {
  const allCollectionTypesDomainModel = new AllCollectionTypesWithObjectsDomainModel();
  const graphSynchronizer = makePreconfiguredAllCollectionTypesGraphSynchronizer();

  // POSTURE VERIFICATION
  expect(allCollectionTypesDomainModel.arrayOfObjects.length).toEqual(0);
  expect(allCollectionTypesDomainModel.mapOfObjects.size).toEqual(0);
  expect(allCollectionTypesDomainModel.setOfObjects.size).toEqual(0);
  expect(allCollectionTypesDomainModel.customCollectionOfObjects.size).toEqual(0);

  // EXECUTE
  graphSynchronizer.synchronize({ rootDomainModel: allCollectionTypesDomainModel, rootsourceObject: mockWatchedAllCollectionsQueryResult_Trio.data });

  // RESULTS VERIFICATION
  expect(allCollectionTypesDomainModel.arrayOfObjects.length).toEqual(3);
  expect(allCollectionTypesDomainModel.mapOfObjects.size).toEqual(3);
  expect(allCollectionTypesDomainModel.setOfObjects.size).toEqual(3);
  expect(allCollectionTypesDomainModel.customCollectionOfObjects.size).toEqual(3);
});

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test('Synchronize all primitive collection types', () => {
  const allCollectionTypesDomainModel = new AllCollectionTypesWithPrimitivesDomainModel();
  const graphSynchronizer = makePreconfiguredAllCollectionTypesGraphSynchronizer();

  // POSTURE VERIFICATION
  expect(allCollectionTypesDomainModel.arrayOfNumbers.length).toEqual(0);
  expect(allCollectionTypesDomainModel.mapOfNumbers.size).toEqual(0);
  expect(allCollectionTypesDomainModel.setOfNumbers.size).toEqual(0);

  // EXECUTE
  graphSynchronizer.synchronize({ rootDomainModel: allCollectionTypesDomainModel, rootsourceObject: mockWatchedAllCollectionsQueryResult_Trio.data });

  // RESULTS VERIFICATION
  expect(allCollectionTypesDomainModel.arrayOfNumbers.length).toEqual(3);
  expect(allCollectionTypesDomainModel.mapOfNumbers.size).toEqual(3);
  expect(allCollectionTypesDomainModel.setOfNumbers.size).toEqual(3);
});

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test('Synchronize collection additions', () => {
  const allCollectionTypesDomainModel = new AllCollectionTypesDomainModel();
  const graphSynchronizer = makePreconfiguredAllCollectionTypesGraphSynchronizer();

  // SETUP
  graphSynchronizer.synchronize({ rootDomainModel: allCollectionTypesDomainModel, rootsourceObject: mockWatchedAllCollectionsQueryResult_Trio.data });

  // POSTURE VERIFICATION
  expect(allCollectionTypesDomainModel.arrayOfNumbers.length).toEqual(3);
  expect(allCollectionTypesDomainModel.mapOfNumbers.size).toEqual(3);
  expect(allCollectionTypesDomainModel.setOfNumbers.size).toEqual(3);
  expect(allCollectionTypesDomainModel.arrayOfObjects.length).toEqual(3);
  expect(allCollectionTypesDomainModel.mapOfObjects.size).toEqual(3);
  expect(allCollectionTypesDomainModel.setOfObjects.size).toEqual(3);
  expect(allCollectionTypesDomainModel.customCollectionOfObjects.size).toEqual(3);

  // EXECUTE
  // Mutate data
  const allCollectionSourceModelWithEdits = _.cloneDeep(mockWatchedAllCollectionsQueryResult_Trio);
  allCollectionSourceModelWithEdits.data.arrayOfNumbers.push(4);
  allCollectionSourceModelWithEdits.data.mapOfNumbers.push(4);
  allCollectionSourceModelWithEdits.data.setOfNumbers.push(4);
  allCollectionSourceModelWithEdits.data.arrayOfObjects.push({ id: '4' });
  allCollectionSourceModelWithEdits.data.mapOfObjects.push({ id: '4' });
  allCollectionSourceModelWithEdits.data.setOfObjects.push({ id: '4' });
  allCollectionSourceModelWithEdits.data.customCollectionOfObjects.push({ id: '4' });

  // RESULTS VERIFICATION
  graphSynchronizer.synchronize({ rootDomainModel: allCollectionTypesDomainModel, rootsourceObject: allCollectionSourceModelWithEdits.data });
  expect(allCollectionTypesDomainModel.arrayOfNumbers.length).toEqual(4);
  expect(allCollectionTypesDomainModel.mapOfNumbers.size).toEqual(4);
  expect(allCollectionTypesDomainModel.setOfNumbers.size).toEqual(4);
  expect(allCollectionTypesDomainModel.arrayOfObjects.length).toEqual(4);
  expect(allCollectionTypesDomainModel.mapOfObjects.size).toEqual(4);
  expect(allCollectionTypesDomainModel.setOfObjects.size).toEqual(4);
  expect(allCollectionTypesDomainModel.customCollectionOfObjects.size).toEqual(4);
});

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test('Synchronize collection removals', () => {
  const allCollectionTypesDomainModel = new AllCollectionTypesDomainModel();
  const graphSynchronizer = makePreconfiguredAllCollectionTypesGraphSynchronizer();

  // SETUP
  graphSynchronizer.synchronize({ rootDomainModel: allCollectionTypesDomainModel, rootsourceObject: mockWatchedAllCollectionsQueryResult_Trio.data });

  // POSTURE VERIFICATION
  expect(allCollectionTypesDomainModel.arrayOfNumbers.length).toEqual(3);
  expect(allCollectionTypesDomainModel.mapOfNumbers.size).toEqual(3);
  expect(allCollectionTypesDomainModel.setOfNumbers.size).toEqual(3);
  expect(allCollectionTypesDomainModel.arrayOfObjects.length).toEqual(3);
  expect(allCollectionTypesDomainModel.mapOfObjects.size).toEqual(3);
  expect(allCollectionTypesDomainModel.setOfObjects.size).toEqual(3);
  expect(allCollectionTypesDomainModel.customCollectionOfObjects.size).toEqual(3);

  // EXECUTE
  // Mutate data
  const allCollectionSourceModelWithEdits = _.cloneDeep(mockWatchedAllCollectionsQueryResult_Trio);
  allCollectionSourceModelWithEdits.data.arrayOfNumbers.pop();
  allCollectionSourceModelWithEdits.data.mapOfNumbers.pop();
  allCollectionSourceModelWithEdits.data.setOfNumbers.pop();
  allCollectionSourceModelWithEdits.data.arrayOfObjects.pop();
  allCollectionSourceModelWithEdits.data.mapOfObjects.pop();
  allCollectionSourceModelWithEdits.data.setOfObjects.pop();
  allCollectionSourceModelWithEdits.data.customCollectionOfObjects.pop();

  // RESULTS VERIFICATION
  graphSynchronizer.synchronize({ rootDomainModel: allCollectionTypesDomainModel, rootsourceObject: allCollectionSourceModelWithEdits.data });
  expect(allCollectionTypesDomainModel.arrayOfNumbers.length).toEqual(2);
  expect(allCollectionTypesDomainModel.mapOfNumbers.size).toEqual(2);
  expect(allCollectionTypesDomainModel.setOfNumbers.size).toEqual(2);
  expect(allCollectionTypesDomainModel.arrayOfObjects.length).toEqual(2);
  expect(allCollectionTypesDomainModel.mapOfObjects.size).toEqual(2);
  expect(allCollectionTypesDomainModel.setOfObjects.size).toEqual(2);
  expect(allCollectionTypesDomainModel.customCollectionOfObjects.size).toEqual(2);
});

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test('Synchronize collection removals - down to zero - with selector targeted configuration', () => {
  const allCollectionTypesDomainModel = new AllCollectionTypesDomainModel();
  const graphSynchronizer = makePreconfiguredAllCollectionTypesGraphSynchronizer();

  // SETUP
  graphSynchronizer.synchronize({ rootDomainModel: allCollectionTypesDomainModel, rootsourceObject: mockWatchedAllCollectionsQueryResult_Uno.data });

  // POSTURE VERIFICATION
  expect(allCollectionTypesDomainModel.arrayOfNumbers.length).toEqual(1);
  expect(allCollectionTypesDomainModel.mapOfNumbers.size).toEqual(1);
  expect(allCollectionTypesDomainModel.setOfNumbers.size).toEqual(1);
  expect(allCollectionTypesDomainModel.arrayOfObjects.length).toEqual(1);
  expect(allCollectionTypesDomainModel.mapOfObjects.size).toEqual(1);
  expect(allCollectionTypesDomainModel.setOfObjects.size).toEqual(1);
  expect(allCollectionTypesDomainModel.customCollectionOfObjects.size).toEqual(1);

  // EXECUTE
  // Mutate data
  const allCollectionSourceModelWithEdits = _.cloneDeep(mockWatchedAllCollectionsQueryResult_Uno);
  allCollectionSourceModelWithEdits.data.arrayOfNumbers.pop();
  allCollectionSourceModelWithEdits.data.mapOfNumbers.pop();
  allCollectionSourceModelWithEdits.data.setOfNumbers.pop();
  allCollectionSourceModelWithEdits.data.arrayOfObjects.pop();
  allCollectionSourceModelWithEdits.data.mapOfObjects.pop();
  allCollectionSourceModelWithEdits.data.setOfObjects.pop();
  allCollectionSourceModelWithEdits.data.customCollectionOfObjects.pop();

  // RESULTS VERIFICATION
  graphSynchronizer.synchronize({ rootDomainModel: allCollectionTypesDomainModel, rootsourceObject: allCollectionSourceModelWithEdits.data });
  expect(allCollectionTypesDomainModel.arrayOfNumbers.length).toEqual(0);
  expect(allCollectionTypesDomainModel.mapOfNumbers.size).toEqual(0);
  expect(allCollectionTypesDomainModel.setOfNumbers.size).toEqual(0);
  expect(allCollectionTypesDomainModel.arrayOfObjects.length).toEqual(0);
  expect(allCollectionTypesDomainModel.mapOfObjects.size).toEqual(0);
  expect(allCollectionTypesDomainModel.setOfObjects.size).toEqual(0);
  expect(allCollectionTypesDomainModel.customCollectionOfObjects.size).toEqual(0);
});

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test('Synchronize collection element edit', () => {
  const allCollectionTypesDomainModel = new AllCollectionTypesDomainModel();
  const graphSynchronizer = makePreconfiguredAllCollectionTypesGraphSynchronizer();

  // SETUP
  graphSynchronizer.synchronize({ rootDomainModel: allCollectionTypesDomainModel, rootsourceObject: mockWatchedAllCollectionsQueryResult_Trio.data });

  // POSTURE VERIFICATION
  expect(allCollectionTypesDomainModel.arrayOfNumbers.length).toEqual(3);
  expect(allCollectionTypesDomainModel.mapOfNumbers.size).toEqual(3);
  expect(allCollectionTypesDomainModel.setOfNumbers.size).toEqual(3);
  expect(allCollectionTypesDomainModel.arrayOfObjects.length).toEqual(3);
  expect(allCollectionTypesDomainModel.mapOfObjects.size).toEqual(3);
  expect(allCollectionTypesDomainModel.setOfObjects.size).toEqual(3);
  expect(allCollectionTypesDomainModel.customCollectionOfObjects.size).toEqual(3);

  // EXECUTE
  // Mutate data
  const allCollectionSourceModelWithEdits = _.cloneDeep(mockWatchedAllCollectionsQueryResult_Trio);
  allCollectionSourceModelWithEdits.data.arrayOfNumbers[0] = 4;
  allCollectionSourceModelWithEdits.data.mapOfNumbers[0] = 4;
  allCollectionSourceModelWithEdits.data.setOfNumbers[0] = 4;
  allCollectionSourceModelWithEdits.data.arrayOfObjects[0]!.id = '4';
  allCollectionSourceModelWithEdits.data.mapOfObjects[0]!.id = '4';
  allCollectionSourceModelWithEdits.data.setOfObjects[0]!.id = '4';
  allCollectionSourceModelWithEdits.data.customCollectionOfObjects[0]!.id = '4';

  // RESULTS VERIFICATION
  graphSynchronizer.synchronize({ rootDomainModel: allCollectionTypesDomainModel, rootsourceObject: allCollectionSourceModelWithEdits.data });
  expect(allCollectionTypesDomainModel.arrayOfNumbers.find((item) => item === 4)).toEqual(4);
  expect(allCollectionTypesDomainModel.mapOfNumbers.get('4')).toEqual(4);
  expect(allCollectionTypesDomainModel.mapOfNumbers.get('1')).toBeUndefined();
  expect(allCollectionTypesDomainModel.setOfNumbers.has(4)).toBeTruthy();
  expect(allCollectionTypesDomainModel.setOfNumbers.has(1)).not.toBeTruthy();
  expect(allCollectionTypesDomainModel.arrayOfObjects.find((item) => item.id === '4')).toBeTruthy();
  expect(allCollectionTypesDomainModel.mapOfObjects.get('4')?.id).toEqual('4');
  expect(allCollectionTypesDomainModel.mapOfObjects.get('1')).toBeUndefined();
  expect(Array.from(allCollectionTypesDomainModel.setOfObjects.values()).find((item) => item.id === '4')).toBeDefined();
  expect(Array.from(allCollectionTypesDomainModel.setOfObjects.values()).find((item) => item.id === '1')).toBeUndefined();
  expect(allCollectionTypesDomainModel.customCollectionOfObjects.map$.get('4')?.id).toEqual('4');
  expect(allCollectionTypesDomainModel.customCollectionOfObjects.map$.get('1')).toBeUndefined();
});

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test('Synchronize collection element - handle null value edits', () => {
  const allCollectionTypesDomainModel = new AllCollectionTypesDomainModel();
  const graphSynchronizer = makePreconfiguredAllCollectionTypesGraphSynchronizer();

  // SETUP
  graphSynchronizer.synchronize({ rootDomainModel: allCollectionTypesDomainModel, rootsourceObject: mockWatchedAllCollectionsQueryResult_Trio.data });

  // POSTURE VERIFICATION
  expect(allCollectionTypesDomainModel.arrayOfNumbers.length).toEqual(3);
  expect(allCollectionTypesDomainModel.mapOfNumbers.size).toEqual(3);
  expect(allCollectionTypesDomainModel.setOfNumbers.size).toEqual(3);
  expect(allCollectionTypesDomainModel.arrayOfObjects.length).toEqual(3);
  expect(allCollectionTypesDomainModel.mapOfObjects.size).toEqual(3);
  expect(allCollectionTypesDomainModel.setOfObjects.size).toEqual(3);
  expect(allCollectionTypesDomainModel.customCollectionOfObjects.size).toEqual(3);

  // EXECUTE
  // Mutate data
  const allCollectionSourceModelWithEdits = _.cloneDeep(mockWatchedAllCollectionsQueryResult_Trio);
  allCollectionSourceModelWithEdits.data.arrayOfNumbers[0] = 4;
  allCollectionSourceModelWithEdits.data.mapOfNumbers[0] = 4;
  allCollectionSourceModelWithEdits.data.setOfNumbers[0] = 4;
  allCollectionSourceModelWithEdits.data.arrayOfObjects[0]!.id = '4';
  allCollectionSourceModelWithEdits.data.mapOfObjects[0]!.id = '4';
  allCollectionSourceModelWithEdits.data.setOfObjects[0]!.id = '4';
  allCollectionSourceModelWithEdits.data.customCollectionOfObjects[0]!.id = '4';

  // RESULTS VERIFICATION
  graphSynchronizer.synchronize({ rootDomainModel: allCollectionTypesDomainModel, rootsourceObject: allCollectionSourceModelWithEdits.data });
  expect(allCollectionTypesDomainModel.arrayOfNumbers.find((item) => item === 4)).toEqual(4);
  expect(allCollectionTypesDomainModel.mapOfNumbers.get('4')).toEqual(4);
  expect(allCollectionTypesDomainModel.mapOfNumbers.get('1')).toBeUndefined();
  expect(allCollectionTypesDomainModel.setOfNumbers.has(4)).toBeTruthy();
  expect(allCollectionTypesDomainModel.setOfNumbers.has(1)).not.toBeTruthy();
  expect(allCollectionTypesDomainModel.arrayOfObjects.find((item) => item.id === '4')).toBeTruthy();
  expect(allCollectionTypesDomainModel.mapOfObjects.get('4')?.id).toEqual('4');
  expect(allCollectionTypesDomainModel.mapOfObjects.get('1')).toBeUndefined();
  expect(Array.from(allCollectionTypesDomainModel.setOfObjects.values()).find((item) => item.id === '4')).toBeDefined();
  expect(Array.from(allCollectionTypesDomainModel.setOfObjects.values()).find((item) => item.id === '1')).toBeUndefined();
  expect(allCollectionTypesDomainModel.customCollectionOfObjects.map$.get('4')?.id).toEqual('4');
  expect(allCollectionTypesDomainModel.customCollectionOfObjects.map$.get('1')).toBeUndefined();
});
