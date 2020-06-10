import _ from 'lodash';
import { allCollectionsJSON_Trio, allCollectionsJSON_Uno, AllCollectionTypesWithObjectsRDO, BookRDO, LibraryRDO, librarySourceJSON } from '.';
import { GraphSynchronizer, IGraphSyncOptions } from '@ablestack/rdo';
import { Logger } from '@ablestack/rdo/infrastructure/logger';
import {
  AllCollectionTypesRDO,
  AllCollectionTypesWithPrimitivesRDO,
  BarRDO,
  BarWithNotesRDO,
  DefaultId$RDO,
  DefaultIdRDO,
  FooDomainGraphSimple,
  FooDomainGraphWithCollection,
  FooRDO,
  FooWithNotesRDO,
  SimpleRDO,
  TargetedOptionsTestRootRDO,
} from './test-rdo-models';
import { fooSourceJSON, fooSourceJSONSimple, fooSourceJSONWithCollection, fooWithNotesSourceJSON, targetedNodeOptionsTestRootJSON } from './test-source-data';
import { Bar, Book, DefaultIdSourceObject, SimpleObject, Library } from './test-source-types';

const logger = Logger.make('autoSynchronize.test.ts');
const FULL_SYNC_ITERATION_COUNT = 500;
const FULL_SYNC_MAX_TIME_MS = 5000;
const CHANGE_SYNC_ITERATION_COUNT = 5000;
const CHANGE_SYNC_MAX_TIME_MS = 1000;

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------

test('Flat object demo', () => {
  const fooRDO = new FooRDO();
  const graphSynchronizer = new GraphSynchronizer();

  // EXECUTE
  graphSynchronizer.smartSync({ rootRdo: fooRDO, rootSourceNode: fooSourceJSON });

  // RESULTS VERIFICATION
  expect(fooRDO.id).toEqual(fooSourceJSON.id);
  expect(fooRDO.name).toEqual(fooSourceJSON.name);
});

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------

test('Simple graph usage demo', () => {
  const fooSimpleRDO = new FooDomainGraphSimple();
  const graphSynchronizer = new GraphSynchronizer();

  // EXECUTE
  graphSynchronizer.smartSync({ rootRdo: fooSimpleRDO, rootSourceNode: fooSourceJSONSimple });

  // RESULTS VERIFICATION
  expect(fooSimpleRDO.bar.id).toEqual(fooSourceJSONSimple.bar.id);
  expect(fooSimpleRDO.bar.name).toEqual(fooSourceJSONSimple.bar.name);
});

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------

test('Collection usage demo', () => {
  const fooRDO = new FooDomainGraphWithCollection();
  const syncOptions: IGraphSyncOptions = {
    targetedNodeOptions: [{ sourceNodeMatcher: { nodePath: 'collectionOfBar' }, makeRdo: (sourceNode: Bar) => new BarRDO() }],
  };

  const graphSynchronizer = new GraphSynchronizer(syncOptions);

  // EXECUTE
  graphSynchronizer.smartSync({ rootRdo: fooRDO, rootSourceNode: fooSourceJSONWithCollection });

  // RESULTS VERIFICATION
  expect(fooRDO.collectionOfBar.size).toEqual(fooSourceJSONWithCollection.collectionOfBar.length);
  expect(fooRDO.collectionOfBar.values().next().value.id).toEqual(fooSourceJSONWithCollection.collectionOfBar[0].id);
});

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------

test('Simple usage demo with notes', () => {
  const fooWithNotesRDO = new FooWithNotesRDO();
  const graphSynchronizer = new GraphSynchronizer({
    targetedNodeOptions: [
      { sourceNodeMatcher: { nodePath: 'arrayOfBar' }, makeRdo: (sourceNode: Bar) => new BarWithNotesRDO() },
      { sourceNodeMatcher: { nodePath: 'mapOfBar' }, makeRdo: (sourceNode: Bar) => new BarWithNotesRDO() },
    ],
  });

  // POSTURE VERIFICATION
  expect(fooWithNotesRDO.mapOfBar.size).toBeFalsy();

  // EXECUTE
  graphSynchronizer.smartSync({ rootRdo: fooWithNotesRDO, rootSourceNode: fooWithNotesSourceJSON });

  // RESULTS VERIFICATION
  expect(fooWithNotesRDO.arrayOfBar.length).toEqual(fooWithNotesSourceJSON.arrayOfBar.length);
  expect(fooWithNotesRDO.arrayOfBar[0].id).toEqual(fooWithNotesSourceJSON.arrayOfBar[0].id);

  expect(fooWithNotesRDO.mapOfBar.size).toEqual(fooWithNotesSourceJSON.mapOfBar.length);
  expect(fooWithNotesRDO.mapOfBar.values().next().value.id).toEqual(fooWithNotesSourceJSON.mapOfBar[0].id);
});

// --------------------------------------------------------------
// SHARED
// --------------------------------------------------------------
function makePreconfiguredLibraryGraphSynchronizerUsingPathOptions() {
  // SETUP
  return new GraphSynchronizer({
    targetedNodeOptions: [{ sourceNodeMatcher: { nodePath: 'authors.books' }, makeRdo: (book: Book) => new BookRDO() }],
    globalNodeOptions: { commonRdoFieldnamePostfix: '$' },
  });
}

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------

test('Synchronize updates complex domain graph as expected', () => {
  const libraryRDO = new LibraryRDO();
  const graphSynchronizer = makePreconfiguredLibraryGraphSynchronizerUsingPathOptions();

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
// TEST
// --------------------------------------------------------------
test(`achieves more than ${FULL_SYNC_ITERATION_COUNT} FULL synchronizations in ${FULL_SYNC_MAX_TIME_MS / 1000} or less, on a medium sized graph`, () => {
  // SETUP
  const iterations = FULL_SYNC_ITERATION_COUNT;
  const libraryRDO = new LibraryRDO();
  const graphSynchronizer = makePreconfiguredLibraryGraphSynchronizerUsingPathOptions();

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

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test(`achieves more than ${CHANGE_SYNC_ITERATION_COUNT} CHANGE synchronizations in ${CHANGE_SYNC_MAX_TIME_MS / 1000} or less, on a medium sized graph`, () => {
  // SETUP
  const iterations = CHANGE_SYNC_ITERATION_COUNT;
  const libraryRDO = new LibraryRDO();
  const graphSynchronizer = makePreconfiguredLibraryGraphSynchronizerUsingPathOptions();

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

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test('Synchronize only updated properties only where source data changed', () => {
  const libraryRDO = new LibraryRDO();
  const graphSynchronizer = makePreconfiguredLibraryGraphSynchronizerUsingPathOptions();

  // Initial data load
  graphSynchronizer.smartSync({ rootRdo: libraryRDO, rootSourceNode: librarySourceJSON });

  // Add method spies
  const library_code_spy_set = jest.spyOn(libraryRDO, 'code$', 'set');
  const library_capacity_spy_set = jest.spyOn(libraryRDO, 'capacity', 'set');

  const authors_0_age_spy_set = jest.spyOn(libraryRDO.authors.array$[0], 'age$', 'set');
  const authors_0_name_spy_set = jest.spyOn(libraryRDO.authors.array$[0], 'name$', 'set');

  const authors_0_books_0_title_spy_set = jest.spyOn(libraryRDO.authors.array$[0].books[0], 'title$', 'get');

  // Mutate data
  const libraryWithEdits = _.cloneDeep(librarySourceJSON);
  libraryWithEdits.code = libraryWithEdits.code + ' - changed';
  libraryWithEdits.authors[0].age = libraryWithEdits.authors[0].age + 2;

  // EXECUTE
  // update
  graphSynchronizer.smartSync({ rootRdo: libraryRDO, rootSourceNode: libraryWithEdits });

  // RESULTS VERIFICATION
  expect(library_code_spy_set).toHaveBeenCalled();
  expect(library_capacity_spy_set).not.toHaveBeenCalled();

  expect(authors_0_age_spy_set).toHaveBeenCalled();
  expect(authors_0_name_spy_set).not.toHaveBeenCalled();
  expect(authors_0_books_0_title_spy_set).not.toHaveBeenCalled(); // This should not have been called, because the isEqual algorithm further up the graph should have determined no change, and so not traversed up the node tree to this point
});

// --------------------------------------------------------------
// SHARED
// --------------------------------------------------------------
function makePreconfiguredLibraryGraphSynchronizerUsingTypeOptions() {
  // SETUP
  return new GraphSynchronizer({
    targetedNodeOptions: [{ sourceNodeMatcher: { nodeContent: (node) => node && node.__type === 'Book' }, makeRdo: (book: Book) => new BookRDO() }],
    globalNodeOptions: { commonRdoFieldnamePostfix: '$' },
  });
}

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test('Synchronize using sourceNodeMatcher config', () => {
  const libraryRDO = new LibraryRDO();
  const graphSynchronizer = makePreconfiguredLibraryGraphSynchronizerUsingTypeOptions();

  // POSTURE VERIFICATION
  expect(libraryRDO.authors.size).toBeFalsy();

  // EXECUTE
  graphSynchronizer.smartSync({ rootRdo: libraryRDO, rootSourceNode: librarySourceJSON });

  // RESULTS VERIFICATION
  expect(libraryRDO.authors.array$[0].books.length).toEqual(librarySourceJSON.authors[0].books.length);
  expect(libraryRDO.authors.array$[0].books[0].id).toEqual(librarySourceJSON.authors[0].books[0].id);
});

// --------------------------------------------------------------
// SHARED
// --------------------------------------------------------------
function makePreconfiguredAllCollectionTypesGraphSynchronizer() {
  // SETUP
  return new GraphSynchronizer({
    targetedNodeOptions: [
      {
        sourceNodeMatcher: { nodeContent: (sourceNode) => sourceNode && sourceNode.__type === 'arrayOfObjectsObject' },
        makeRdo: (o: SimpleObject) => new SimpleRDO(),
      },
      {
        sourceNodeMatcher: { nodeContent: (sourceNode) => sourceNode && sourceNode.__type === 'mapOfObjectsObject' },
        makeRdo: (o: SimpleObject) => new SimpleRDO(),
      },
      {
        sourceNodeMatcher: { nodeContent: (sourceNode) => sourceNode && sourceNode.__type === 'setOfObjectsObject' },
        makeRdo: (o: SimpleObject) => new SimpleRDO(),
      },
      {
        sourceNodeMatcher: { nodeContent: (sourceNode) => sourceNode && sourceNode.__type === 'customCollectionOfObjectsObject' },
        makeRdo: (o: SimpleObject) => new SimpleRDO(),
      },
    ],
    globalNodeOptions: { commonRdoFieldnamePostfix: '$' },
  });
}

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test('Synchronize all object collection types', () => {
  const allCollectionTypesRDO = new AllCollectionTypesWithObjectsRDO();
  const graphSynchronizer = makePreconfiguredAllCollectionTypesGraphSynchronizer();

  // POSTURE VERIFICATION
  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(0);
  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(0);
  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(0);
  expect(allCollectionTypesRDO.customCollectionOfObjects.size).toEqual(0);

  // EXECUTE
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionsJSON_Trio });

  // RESULTS VERIFICATION
  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(3);
  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(3);
  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(3);
  expect(allCollectionTypesRDO.customCollectionOfObjects.size).toEqual(3);
});

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test('Synchronize all primitive collection types', () => {
  const allCollectionTypesRDO = new AllCollectionTypesWithPrimitivesRDO();
  const graphSynchronizer = makePreconfiguredAllCollectionTypesGraphSynchronizer();

  // POSTURE VERIFICATION
  expect(allCollectionTypesRDO.arrayOfNumbers.length).toEqual(0);
  expect(allCollectionTypesRDO.mapOfNumbers.size).toEqual(0);
  expect(allCollectionTypesRDO.setOfNumbers.size).toEqual(0);

  // EXECUTE
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionsJSON_Trio });

  // RESULTS VERIFICATION
  expect(allCollectionTypesRDO.arrayOfNumbers.length).toEqual(3);
  expect(allCollectionTypesRDO.mapOfNumbers.size).toEqual(3);
  expect(allCollectionTypesRDO.setOfNumbers.size).toEqual(3);
});

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test('Synchronize collection additions', () => {
  const allCollectionTypesRDO = new AllCollectionTypesRDO();
  const graphSynchronizer = makePreconfiguredAllCollectionTypesGraphSynchronizer();

  // SETUP
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionsJSON_Trio });

  // POSTURE VERIFICATION
  expect(allCollectionTypesRDO.arrayOfNumbers.length).toEqual(3);
  expect(allCollectionTypesRDO.mapOfNumbers.size).toEqual(3);
  expect(allCollectionTypesRDO.setOfNumbers.size).toEqual(3);
  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(3);
  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(3);
  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(3);
  expect(allCollectionTypesRDO.customCollectionOfObjects.size).toEqual(3);

  // EXECUTE
  // Mutate data
  const allCollectionSourceModelWithEdits = _.cloneDeep(allCollectionsJSON_Trio);
  allCollectionSourceModelWithEdits.arrayOfNumbers.push(4);
  allCollectionSourceModelWithEdits.mapOfNumbers.push(4);
  allCollectionSourceModelWithEdits.setOfNumbers.push(4);
  allCollectionSourceModelWithEdits.arrayOfObjects.push({ id: '4' });
  allCollectionSourceModelWithEdits.mapOfObjects.push({ id: '4' });
  allCollectionSourceModelWithEdits.setOfObjects.push({ id: '4' });
  allCollectionSourceModelWithEdits.customCollectionOfObjects.push({ id: '4' });

  // RESULTS VERIFICATION
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionSourceModelWithEdits });
  expect(allCollectionTypesRDO.arrayOfNumbers.length).toEqual(4);
  expect(allCollectionTypesRDO.mapOfNumbers.size).toEqual(4);
  expect(allCollectionTypesRDO.setOfNumbers.size).toEqual(4);
  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(4);
  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(4);
  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(4);
  expect(allCollectionTypesRDO.customCollectionOfObjects.size).toEqual(4);
});

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test('Synchronize collection removals', () => {
  const allCollectionTypesRDO = new AllCollectionTypesRDO();
  const graphSynchronizer = makePreconfiguredAllCollectionTypesGraphSynchronizer();

  // SETUP
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionsJSON_Trio });

  // POSTURE VERIFICATION
  expect(allCollectionTypesRDO.arrayOfNumbers.length).toEqual(3);
  expect(allCollectionTypesRDO.mapOfNumbers.size).toEqual(3);
  expect(allCollectionTypesRDO.setOfNumbers.size).toEqual(3);
  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(3);
  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(3);
  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(3);
  expect(allCollectionTypesRDO.customCollectionOfObjects.size).toEqual(3);

  // EXECUTE
  // Mutate data
  const allCollectionSourceModelWithEdits = _.cloneDeep(allCollectionsJSON_Trio);
  allCollectionSourceModelWithEdits.arrayOfNumbers.pop();
  allCollectionSourceModelWithEdits.mapOfNumbers.pop();
  allCollectionSourceModelWithEdits.setOfNumbers.pop();
  allCollectionSourceModelWithEdits.arrayOfObjects.pop();
  allCollectionSourceModelWithEdits.mapOfObjects.pop();
  allCollectionSourceModelWithEdits.setOfObjects.pop();
  allCollectionSourceModelWithEdits.customCollectionOfObjects.pop();

  // RESULTS VERIFICATION
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionSourceModelWithEdits });
  expect(allCollectionTypesRDO.arrayOfNumbers.length).toEqual(2);
  expect(allCollectionTypesRDO.mapOfNumbers.size).toEqual(2);
  expect(allCollectionTypesRDO.setOfNumbers.size).toEqual(2);
  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(2);
  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(2);
  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(2);
  expect(allCollectionTypesRDO.customCollectionOfObjects.size).toEqual(2);
});

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test('Synchronize collection removals - down to zero - with sourceNodeMatcher targeted configuration', () => {
  const allCollectionTypesRDO = new AllCollectionTypesRDO();
  const graphSynchronizer = makePreconfiguredAllCollectionTypesGraphSynchronizer();

  // SETUP
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionsJSON_Uno });

  // POSTURE VERIFICATION
  expect(allCollectionTypesRDO.arrayOfNumbers.length).toEqual(1);
  expect(allCollectionTypesRDO.mapOfNumbers.size).toEqual(1);
  expect(allCollectionTypesRDO.setOfNumbers.size).toEqual(1);
  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(1);
  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(1);
  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(1);
  expect(allCollectionTypesRDO.customCollectionOfObjects.size).toEqual(1);

  // EXECUTE
  // Mutate data
  const allCollectionSourceModelWithEdits = _.cloneDeep(allCollectionsJSON_Uno);
  allCollectionSourceModelWithEdits.arrayOfNumbers.pop();
  allCollectionSourceModelWithEdits.mapOfNumbers.pop();
  allCollectionSourceModelWithEdits.setOfNumbers.pop();
  allCollectionSourceModelWithEdits.arrayOfObjects.pop();
  allCollectionSourceModelWithEdits.mapOfObjects.pop();
  allCollectionSourceModelWithEdits.setOfObjects.pop();
  allCollectionSourceModelWithEdits.customCollectionOfObjects.pop();

  // RESULTS VERIFICATION
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionSourceModelWithEdits });
  expect(allCollectionTypesRDO.arrayOfNumbers.length).toEqual(0);
  expect(allCollectionTypesRDO.mapOfNumbers.size).toEqual(0);
  expect(allCollectionTypesRDO.setOfNumbers.size).toEqual(0);
  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(0);
  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(0);
  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(0);
  expect(allCollectionTypesRDO.customCollectionOfObjects.size).toEqual(0);
});

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test('Synchronize collection element edit', () => {
  const allCollectionTypesRDO = new AllCollectionTypesRDO();
  const graphSynchronizer = makePreconfiguredAllCollectionTypesGraphSynchronizer();

  // SETUP
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionsJSON_Trio });

  // POSTURE VERIFICATION
  expect(allCollectionTypesRDO.arrayOfNumbers.length).toEqual(3);
  expect(allCollectionTypesRDO.mapOfNumbers.size).toEqual(3);
  expect(allCollectionTypesRDO.setOfNumbers.size).toEqual(3);
  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(3);
  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(3);
  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(3);
  expect(allCollectionTypesRDO.customCollectionOfObjects.size).toEqual(3);

  // EXECUTE
  // Mutate data
  const allCollectionSourceModelWithEdits = _.cloneDeep(allCollectionsJSON_Trio);
  allCollectionSourceModelWithEdits.arrayOfNumbers[0] = 4;
  allCollectionSourceModelWithEdits.mapOfNumbers[0] = 4;
  allCollectionSourceModelWithEdits.setOfNumbers[0] = 4;
  allCollectionSourceModelWithEdits.arrayOfObjects[0]!.id = '4';
  allCollectionSourceModelWithEdits.mapOfObjects[0]!.id = '4';
  allCollectionSourceModelWithEdits.setOfObjects[0]!.id = '4';
  allCollectionSourceModelWithEdits.customCollectionOfObjects[0]!.id = '4';

  // RESULTS VERIFICATION
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionSourceModelWithEdits });
  expect(allCollectionTypesRDO.arrayOfNumbers.find((item) => item === 4)).toEqual(4);
  expect(allCollectionTypesRDO.mapOfNumbers.get('4')).toEqual(4);
  expect(allCollectionTypesRDO.mapOfNumbers.get('1')).toBeUndefined();
  expect(allCollectionTypesRDO.setOfNumbers.has(4)).toBeTruthy();
  expect(allCollectionTypesRDO.setOfNumbers.has(1)).not.toBeTruthy();
  expect(allCollectionTypesRDO.arrayOfObjects.find((item) => item.id === '4')).toBeTruthy();
  expect(allCollectionTypesRDO.mapOfObjects.get('4')?.id).toEqual('4');
  expect(allCollectionTypesRDO.mapOfObjects.get('1')).toBeUndefined();
  expect(Array.from(allCollectionTypesRDO.setOfObjects.values()).find((item) => item.id === '4')).toBeDefined();
  expect(Array.from(allCollectionTypesRDO.setOfObjects.values()).find((item) => item.id === '1')).toBeUndefined();
  expect(allCollectionTypesRDO.customCollectionOfObjects.get('4')?.id).toEqual('4');
  expect(allCollectionTypesRDO.customCollectionOfObjects.get('1')).toBeUndefined();
});

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test('Synchronize collection element - handle null value edits', () => {
  const allCollectionTypesRDO = new AllCollectionTypesRDO();
  const graphSynchronizer = makePreconfiguredAllCollectionTypesGraphSynchronizer();

  // SETUP
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionsJSON_Trio });

  // POSTURE VERIFICATION
  expect(allCollectionTypesRDO.arrayOfNumbers.length).toEqual(3);
  expect(allCollectionTypesRDO.mapOfNumbers.size).toEqual(3);
  expect(allCollectionTypesRDO.setOfNumbers.size).toEqual(3);
  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(3);
  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(3);
  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(3);
  expect(allCollectionTypesRDO.customCollectionOfObjects.size).toEqual(3);

  // EXECUTE
  // Mutate data
  const allCollectionSourceModelWithEdits = _.cloneDeep(allCollectionsJSON_Trio);
  allCollectionSourceModelWithEdits.arrayOfNumbers[0] = 4;
  allCollectionSourceModelWithEdits.mapOfNumbers[0] = 4;
  allCollectionSourceModelWithEdits.setOfNumbers[0] = 4;
  allCollectionSourceModelWithEdits.arrayOfObjects[0]!.id = '4';
  allCollectionSourceModelWithEdits.mapOfObjects[0]!.id = '4';
  allCollectionSourceModelWithEdits.setOfObjects[0]!.id = '4';
  allCollectionSourceModelWithEdits.customCollectionOfObjects[0]!.id = '4';

  // RESULTS VERIFICATION
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionSourceModelWithEdits });
  expect(allCollectionTypesRDO.arrayOfNumbers.find((item) => item === 4)).toEqual(4);
  expect(allCollectionTypesRDO.mapOfNumbers.get('4')).toEqual(4);
  expect(allCollectionTypesRDO.mapOfNumbers.get('1')).toBeUndefined();
  expect(allCollectionTypesRDO.setOfNumbers.has(4)).toBeTruthy();
  expect(allCollectionTypesRDO.setOfNumbers.has(1)).not.toBeTruthy();
  expect(allCollectionTypesRDO.arrayOfObjects.find((item) => item.id === '4')).toBeTruthy();
  expect(allCollectionTypesRDO.mapOfObjects.get('4')?.id).toEqual('4');
  expect(allCollectionTypesRDO.mapOfObjects.get('1')).toBeUndefined();
  expect(Array.from(allCollectionTypesRDO.setOfObjects.values()).find((item) => item.id === '4')).toBeDefined();
  expect(Array.from(allCollectionTypesRDO.setOfObjects.values()).find((item) => item.id === '1')).toBeUndefined();
  expect(allCollectionTypesRDO.customCollectionOfObjects.get('4')?.id).toEqual('4');
  expect(allCollectionTypesRDO.customCollectionOfObjects.get('1')).toBeUndefined();
});

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------

test('commonRdoFieldnamePostfix works with DefaultSourceNodeKeyMakers, AND test that ignore option works', () => {
  const targetedNodeOptionsTestRootRDO = new TargetedOptionsTestRootRDO();
  const graphSynchronizer = new GraphSynchronizer({
    targetedNodeOptions: [
      { sourceNodeMatcher: { nodePath: 'mapOfDefaultIdRDO' }, makeRdo: (sourceNode: DefaultIdSourceObject) => new DefaultIdRDO() },
      { sourceNodeMatcher: { nodePath: 'mapOfDefaultId$RDO' }, makeRdo: (sourceNode: DefaultIdSourceObject) => new DefaultId$RDO() },
      { sourceNodeMatcher: { nodePath: 'mapOfDefault_IdRDO' }, ignore: true },
    ],
    globalNodeOptions: { commonRdoFieldnamePostfix: '$' },
  });

  // POSTURE VERIFICATION
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultIdRDO.length).toBeFalsy();
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultIdRDO.length).toBeFalsy();

  // LOAD DATA
  graphSynchronizer.smartSync({ rootRdo: targetedNodeOptionsTestRootRDO, rootSourceNode: targetedNodeOptionsTestRootJSON });

  // RESULTS VERIFICATION STAGE 1
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultIdRDO.length).toEqual(targetedNodeOptionsTestRootJSON.mapOfDefaultIdRDO.length);
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultIdRDO.values().next().value.id).toEqual(targetedNodeOptionsTestRootJSON.mapOfDefaultIdRDO[0].id);

  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultId$RDO.length).toEqual(targetedNodeOptionsTestRootJSON.mapOfDefaultId$RDO.length);
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultId$RDO.values().next().value.id$).toEqual(targetedNodeOptionsTestRootJSON.mapOfDefaultId$RDO[0].id);

  // REMOVE ITEM & SYNC
  const targetedNodeOptionsTestRootJSONWithEdits = _.cloneDeep(targetedNodeOptionsTestRootJSON);
  targetedNodeOptionsTestRootJSONWithEdits.mapOfDefaultIdRDO.pop();
  targetedNodeOptionsTestRootJSONWithEdits.mapOfDefaultId$RDO.pop();
  graphSynchronizer.smartSync({ rootRdo: targetedNodeOptionsTestRootRDO, rootSourceNode: targetedNodeOptionsTestRootJSONWithEdits });

  // RESULTS VERIFICATION STAGE 2
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultIdRDO.length).toEqual(1);
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultIdRDO.values().next().value.id).toEqual(targetedNodeOptionsTestRootJSONWithEdits.mapOfDefaultIdRDO[0].id);

  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultId$RDO.length).toEqual(1);
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultId$RDO.values().next().value.id$).toEqual(targetedNodeOptionsTestRootJSONWithEdits.mapOfDefaultId$RDO[0].id);

  // REMOVE ANOTHER ITEM & SYNC
  targetedNodeOptionsTestRootJSONWithEdits.mapOfDefaultIdRDO.pop();
  targetedNodeOptionsTestRootJSONWithEdits.mapOfDefaultId$RDO.pop();
  graphSynchronizer.smartSync({ rootRdo: targetedNodeOptionsTestRootRDO, rootSourceNode: targetedNodeOptionsTestRootJSONWithEdits });

  // RESULTS VERIFICATION STAGE 3
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultIdRDO.length).toEqual(0);
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultId$RDO.length).toEqual(0);

  // ADD ITEM & SYNC
  targetedNodeOptionsTestRootJSONWithEdits.mapOfDefaultIdRDO.push({ id: '4A' });
  targetedNodeOptionsTestRootJSONWithEdits.mapOfDefaultId$RDO.push({ id: '4B' });
  graphSynchronizer.smartSync({ rootRdo: targetedNodeOptionsTestRootRDO, rootSourceNode: targetedNodeOptionsTestRootJSONWithEdits });

  // RESULTS VERIFICATION STAGE 2
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultIdRDO.length).toEqual(1);
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultIdRDO.values().next().value.id).toEqual(targetedNodeOptionsTestRootJSONWithEdits.mapOfDefaultIdRDO[0].id);

  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultId$RDO.length).toEqual(1);
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultId$RDO.values().next().value.id$).toEqual(targetedNodeOptionsTestRootJSONWithEdits.mapOfDefaultId$RDO[0].id);
});

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------

test('commonRdoFieldnamePostfix works with DefaultSourceNodeKeyMakers', () => {
  const targetedNodeOptionsTestRootRDO = new TargetedOptionsTestRootRDO();
  const graphSynchronizer = new GraphSynchronizer({
    targetedNodeOptions: [
      { sourceNodeMatcher: { nodePath: 'mapOfDefaultIdRDO' }, ignore: true },
      { sourceNodeMatcher: { nodePath: 'mapOfDefaultId$RDO' }, ignore: true },
      {
        sourceNodeMatcher: { nodePath: 'mapOfDefault_IdRDO' },
        makeRdo: (sourceNode: DefaultIdSourceObject) => new DefaultId$RDO(),
        makeRdoCollectionKey: { fromSourceElement: (sourceNode) => sourceNode.id, fromRdoElement: (RDO) => RDO._id },
      },
    ],
    globalNodeOptions: { commonRdoFieldnamePostfix: '$' },
  });

  // POSTURE VERIFICATION
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultIdRDO.length).toBeFalsy();
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultIdRDO.length).toBeFalsy();

  // EXECUTE
  graphSynchronizer.smartSync({ rootRdo: targetedNodeOptionsTestRootRDO, rootSourceNode: targetedNodeOptionsTestRootJSON });

  // RESULTS VERIFICATION
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultIdRDO.length).toEqual(0);
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultId$RDO.length).toEqual(0);

  expect(targetedNodeOptionsTestRootRDO.mapOfDefault_IdRDO.length).toEqual(targetedNodeOptionsTestRootJSON.mapOfDefault_IdRDO.length);
  expect(targetedNodeOptionsTestRootRDO.mapOfDefault_IdRDO.values().next().value.id$).toEqual(targetedNodeOptionsTestRootJSON.mapOfDefault_IdRDO[0].id);
});
