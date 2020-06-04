import { BookDomainModel, LibraryDomainModel, librarySourceJSON, AllCollectionTypesWithObjectsDomainModel, allCollectionsJSON_Trio, allCollectionsJSON_Uno } from '.';
import { GraphSynchronizer } from '../src';
import { Logger } from '../src/logger';
import { Book, SimpleObject, Bar, DefaultIdSourceObject } from './test-source-types';
import _ from 'lodash';
import {
  SimpleObjectDomainModel,
  AllCollectionTypesWithPrimitivesDomainModel,
  AllCollectionTypesDomainModel,
  BarDomainModel,
  FooDomainModel,
  TargetedOptionsTestRootDomainModel,
  DefaultIdDomainModel,
  DefaultId$DomainModel,
  FooWithNotesDomainModel,
  BarWithNotesDomainModel,
} from './test-domain-models';
import { fooSourceJSON, targetedOptionsTestRootJSON, fooWithNotesSourceJSON } from './test-data';

const logger = Logger.make('autoSynchronize.test.ts');
const PERF_TEST_ITERATION_COUNT_MS = 1000;
const PERF_TEST_MAX_TIME_MS = 500;

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------

test('Simple usage demo', () => {
  const fooDomainModel = new FooDomainModel();
  const graphSynchronizer = new GraphSynchronizer({
    targetedOptions: [{ selector: { path: 'mapOfBar' }, domainModelCreation: { makeDomainModel: (sourceNode: Bar) => new BarDomainModel() } }],
  });

  // EXECUTE
  graphSynchronizer.synchronize({ rootDomainNode: fooDomainModel, rootSourceNode: fooSourceJSON });

  // RESULTS VERIFICATION
  expect(fooDomainModel.mapOfBar.size).toEqual(fooSourceJSON.mapOfBar.length);
  expect(fooDomainModel.mapOfBar.values().next().value.id).toEqual(fooSourceJSON.mapOfBar[0].id);
});

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------

test('Simple usage demo with notes', () => {
  const fooWithNotesDomainModel = new FooWithNotesDomainModel();
  const graphSynchronizer = new GraphSynchronizer({
    targetedOptions: [
      { selector: { path: 'arrayOfBar' }, domainModelCreation: { makeDomainModel: (sourceNode: Bar) => new BarWithNotesDomainModel() } },
      { selector: { path: 'mapOfBar' }, domainModelCreation: { makeDomainModel: (sourceNode: Bar) => new BarWithNotesDomainModel() } },
    ],
  });

  // POSTURE VERIFICATION
  expect(fooWithNotesDomainModel.mapOfBar.size).toBeFalsy();

  // EXECUTE
  graphSynchronizer.synchronize({ rootDomainNode: fooWithNotesDomainModel, rootSourceNode: fooWithNotesSourceJSON });

  // RESULTS VERIFICATION
  expect(fooWithNotesDomainModel.arrayOfBar.length).toEqual(fooWithNotesSourceJSON.arrayOfBar.length);
  expect(fooWithNotesDomainModel.arrayOfBar[0].id).toEqual(fooWithNotesSourceJSON.arrayOfBar[0].id);

  expect(fooWithNotesDomainModel.mapOfBar.size).toEqual(fooWithNotesSourceJSON.mapOfBar.length);
  expect(fooWithNotesDomainModel.mapOfBar.values().next().value.id).toEqual(fooWithNotesSourceJSON.mapOfBar[0].id);
});

// --------------------------------------------------------------
// SHARED
// --------------------------------------------------------------
function makePreconfiguredLibraryGraphSynchronizerUsingPathOptions() {
  // SETUP
  return new GraphSynchronizer({
    targetedOptions: [{ selector: { path: 'authors.books' }, domainModelCreation: { makeDomainModel: (book: Book) => new BookDomainModel() } }],
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
  graphSynchronizer.synchronize({ rootDomainNode: libraryDomainModel, rootSourceNode: librarySourceJSON });

  // RESULTS VERIFICATION
  expect(libraryDomainModel.name).not.toBeFalsy();
  expect(libraryDomainModel.city$).not.toBeFalsy();
  expect(libraryDomainModel.authors.size).not.toBeFalsy();

  expect(libraryDomainModel.name).toEqual(librarySourceJSON.name);
  expect(libraryDomainModel.city$).toEqual(librarySourceJSON.city);

  expect(libraryDomainModel.authors.size).toEqual(librarySourceJSON.authors.length);
  expect(libraryDomainModel.authors.array$[0].id).toEqual(librarySourceJSON.authors[0].id);
  expect(libraryDomainModel.authors.array$[0].name$).toEqual(librarySourceJSON.authors[0].name);
  expect(libraryDomainModel.authors.array$[0].age$).toEqual(librarySourceJSON.authors[0].age);

  expect(libraryDomainModel.authors.array$[0].books.length).toEqual(librarySourceJSON.authors[0].books.length);
  expect(libraryDomainModel.authors.array$[0].books[0].id).toEqual(librarySourceJSON.authors[0].books[0].id);
  expect(libraryDomainModel.authors.array$[0].books[0].title$).toEqual(librarySourceJSON.authors[0].books[0].title);
  expect(libraryDomainModel.authors.array$[0].books[0].publisher).toBeDefined();
  expect(libraryDomainModel.authors.array$[0].books[0].publisher.id).toEqual(librarySourceJSON.authors[0].books[0].publisher.id);
  expect(libraryDomainModel.authors.array$[0].books[0].publisher.name$).toEqual(librarySourceJSON.authors[0].books[0].publisher.name);
});

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test(`achieves more than ${PERF_TEST_ITERATION_COUNT_MS} full synchronizations in ${PERF_TEST_MAX_TIME_MS / 1000} or less, on a medium sized graph`, () => {
  // SETUP
  const iterations = PERF_TEST_ITERATION_COUNT_MS;
  const libraryDomainModel = new LibraryDomainModel();
  const graphSynchronizer = makePreconfiguredLibraryGraphSynchronizerUsingPathOptions();

  // EXECUTE
  const startTime = performance.now();

  for (let i = 0; i < iterations; i++) {
    graphSynchronizer.synchronize({ rootDomainNode: libraryDomainModel, rootSourceNode: librarySourceJSON });
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
  graphSynchronizer.synchronize({ rootDomainNode: libraryDomainModel, rootSourceNode: librarySourceJSON });

  // Add method spies
  const library_code_spy = jest.spyOn(libraryDomainModel, 'code$', 'set');
  const library_capacity_spy = jest.spyOn(libraryDomainModel, 'capacity', 'set');

  const authors_0_age_spy = jest.spyOn(libraryDomainModel.authors.array$[0], 'age$', 'set');
  const authors_0_name_spy = jest.spyOn(libraryDomainModel.authors.array$[0], 'name$', 'set');

  // Mutate data
  const libraryWithEdits = _.cloneDeep(librarySourceJSON);
  libraryWithEdits.code = libraryWithEdits.code + ' - changed';
  libraryWithEdits.authors[0].age = libraryWithEdits.authors[0].age + 2;

  // EXECUTE
  // update
  graphSynchronizer.synchronize({ rootDomainNode: libraryDomainModel, rootSourceNode: libraryWithEdits });

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
    targetedOptions: [{ selector: { matcher: (node) => node && node.__type === 'Book' }, domainModelCreation: { makeDomainModel: (book: Book) => new BookDomainModel() } }],
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
  graphSynchronizer.synchronize({ rootDomainNode: libraryDomainModel, rootSourceNode: librarySourceJSON });

  // RESULTS VERIFICATION
  expect(libraryDomainModel.authors.array$[0].books.length).toEqual(librarySourceJSON.authors[0].books.length);
  expect(libraryDomainModel.authors.array$[0].books[0].id).toEqual(librarySourceJSON.authors[0].books[0].id);
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
        domainModelCreation: { makeDomainModel: (o: SimpleObject) => new SimpleObjectDomainModel() },
      },
      {
        selector: { matcher: (sourceNode) => sourceNode && sourceNode.__type === 'mapOfObjectsObject' },
        domainModelCreation: { makeDomainModel: (o: SimpleObject) => new SimpleObjectDomainModel() },
      },
      {
        selector: { matcher: (sourceNode) => sourceNode && sourceNode.__type === 'setOfObjectsObject' },
        domainModelCreation: { makeDomainModel: (o: SimpleObject) => new SimpleObjectDomainModel() },
      },
      {
        selector: { matcher: (sourceNode) => sourceNode && sourceNode.__type === 'customCollectionOfObjectsObject' },
        domainModelCreation: { makeDomainModel: (o: SimpleObject) => new SimpleObjectDomainModel() },
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
  graphSynchronizer.synchronize({ rootDomainNode: allCollectionTypesDomainModel, rootSourceNode: allCollectionsJSON_Trio });

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
  graphSynchronizer.synchronize({ rootDomainNode: allCollectionTypesDomainModel, rootSourceNode: allCollectionsJSON_Trio });

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
  graphSynchronizer.synchronize({ rootDomainNode: allCollectionTypesDomainModel, rootSourceNode: allCollectionsJSON_Trio });

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
  const allCollectionSourceModelWithEdits = _.cloneDeep(allCollectionsJSON_Trio);
  allCollectionSourceModelWithEdits.arrayOfNumbers.push(4);
  allCollectionSourceModelWithEdits.mapOfNumbers.push(4);
  allCollectionSourceModelWithEdits.setOfNumbers.push(4);
  allCollectionSourceModelWithEdits.arrayOfObjects.push({ id: '4' });
  allCollectionSourceModelWithEdits.mapOfObjects.push({ id: '4' });
  allCollectionSourceModelWithEdits.setOfObjects.push({ id: '4' });
  allCollectionSourceModelWithEdits.customCollectionOfObjects.push({ id: '4' });

  // RESULTS VERIFICATION
  graphSynchronizer.synchronize({ rootDomainNode: allCollectionTypesDomainModel, rootSourceNode: allCollectionSourceModelWithEdits });
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
  graphSynchronizer.synchronize({ rootDomainNode: allCollectionTypesDomainModel, rootSourceNode: allCollectionsJSON_Trio });

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
  const allCollectionSourceModelWithEdits = _.cloneDeep(allCollectionsJSON_Trio);
  allCollectionSourceModelWithEdits.arrayOfNumbers.pop();
  allCollectionSourceModelWithEdits.mapOfNumbers.pop();
  allCollectionSourceModelWithEdits.setOfNumbers.pop();
  allCollectionSourceModelWithEdits.arrayOfObjects.pop();
  allCollectionSourceModelWithEdits.mapOfObjects.pop();
  allCollectionSourceModelWithEdits.setOfObjects.pop();
  allCollectionSourceModelWithEdits.customCollectionOfObjects.pop();

  // RESULTS VERIFICATION
  graphSynchronizer.synchronize({ rootDomainNode: allCollectionTypesDomainModel, rootSourceNode: allCollectionSourceModelWithEdits });
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
  graphSynchronizer.synchronize({ rootDomainNode: allCollectionTypesDomainModel, rootSourceNode: allCollectionsJSON_Uno });

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
  const allCollectionSourceModelWithEdits = _.cloneDeep(allCollectionsJSON_Uno);
  allCollectionSourceModelWithEdits.arrayOfNumbers.pop();
  allCollectionSourceModelWithEdits.mapOfNumbers.pop();
  allCollectionSourceModelWithEdits.setOfNumbers.pop();
  allCollectionSourceModelWithEdits.arrayOfObjects.pop();
  allCollectionSourceModelWithEdits.mapOfObjects.pop();
  allCollectionSourceModelWithEdits.setOfObjects.pop();
  allCollectionSourceModelWithEdits.customCollectionOfObjects.pop();

  // RESULTS VERIFICATION
  graphSynchronizer.synchronize({ rootDomainNode: allCollectionTypesDomainModel, rootSourceNode: allCollectionSourceModelWithEdits });
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
  graphSynchronizer.synchronize({ rootDomainNode: allCollectionTypesDomainModel, rootSourceNode: allCollectionsJSON_Trio });

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
  const allCollectionSourceModelWithEdits = _.cloneDeep(allCollectionsJSON_Trio);
  allCollectionSourceModelWithEdits.arrayOfNumbers[0] = 4;
  allCollectionSourceModelWithEdits.mapOfNumbers[0] = 4;
  allCollectionSourceModelWithEdits.setOfNumbers[0] = 4;
  allCollectionSourceModelWithEdits.arrayOfObjects[0]!.id = '4';
  allCollectionSourceModelWithEdits.mapOfObjects[0]!.id = '4';
  allCollectionSourceModelWithEdits.setOfObjects[0]!.id = '4';
  allCollectionSourceModelWithEdits.customCollectionOfObjects[0]!.id = '4';

  // RESULTS VERIFICATION
  graphSynchronizer.synchronize({ rootDomainNode: allCollectionTypesDomainModel, rootSourceNode: allCollectionSourceModelWithEdits });
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
  graphSynchronizer.synchronize({ rootDomainNode: allCollectionTypesDomainModel, rootSourceNode: allCollectionsJSON_Trio });

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
  const allCollectionSourceModelWithEdits = _.cloneDeep(allCollectionsJSON_Trio);
  allCollectionSourceModelWithEdits.arrayOfNumbers[0] = 4;
  allCollectionSourceModelWithEdits.mapOfNumbers[0] = 4;
  allCollectionSourceModelWithEdits.setOfNumbers[0] = 4;
  allCollectionSourceModelWithEdits.arrayOfObjects[0]!.id = '4';
  allCollectionSourceModelWithEdits.mapOfObjects[0]!.id = '4';
  allCollectionSourceModelWithEdits.setOfObjects[0]!.id = '4';
  allCollectionSourceModelWithEdits.customCollectionOfObjects[0]!.id = '4';

  // RESULTS VERIFICATION
  graphSynchronizer.synchronize({ rootDomainNode: allCollectionTypesDomainModel, rootSourceNode: allCollectionSourceModelWithEdits });
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

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------

test('tryStandardPostfix works with DefaultSourceNodeKeyMakers, AND test that ignore option works', () => {
  const targetedOptionsTestRootDomainModel = new TargetedOptionsTestRootDomainModel();
  const graphSynchronizer = new GraphSynchronizer({
    targetedOptions: [
      { selector: { path: 'mapOfDefaultIdDomainModel' }, domainModelCreation: { makeDomainModel: (sourceNode: DefaultIdSourceObject) => new DefaultIdDomainModel() } },
      { selector: { path: 'mapOfDefaultId$DomainModel' }, domainModelCreation: { makeDomainModel: (sourceNode: DefaultIdSourceObject) => new DefaultId$DomainModel() } },
      { selector: { path: 'mapOfDefault_IdDomainModel' }, ignore: true },
    ],
    globalOptions: { tryStandardPostfix: '$' },
  });

  // POSTURE VERIFICATION
  expect(targetedOptionsTestRootDomainModel.mapOfDefaultIdDomainModel.length).toBeFalsy();
  expect(targetedOptionsTestRootDomainModel.mapOfDefaultIdDomainModel.length).toBeFalsy();

  // LOAD DATA
  graphSynchronizer.synchronize({ rootDomainNode: targetedOptionsTestRootDomainModel, rootSourceNode: targetedOptionsTestRootJSON });

  // RESULTS VERIFICATION STAGE 1
  expect(targetedOptionsTestRootDomainModel.mapOfDefaultIdDomainModel.length).toEqual(targetedOptionsTestRootJSON.mapOfDefaultIdDomainModel.length);
  expect(targetedOptionsTestRootDomainModel.mapOfDefaultIdDomainModel.values().next().value.id).toEqual(targetedOptionsTestRootJSON.mapOfDefaultIdDomainModel[0].id);

  expect(targetedOptionsTestRootDomainModel.mapOfDefaultId$DomainModel.length).toEqual(targetedOptionsTestRootJSON.mapOfDefaultId$DomainModel.length);
  expect(targetedOptionsTestRootDomainModel.mapOfDefaultId$DomainModel.values().next().value.id$).toEqual(targetedOptionsTestRootJSON.mapOfDefaultId$DomainModel[0].id);

  // REMOVE ITEM & SYNC
  const targetedOptionsTestRootJSONWithEdits = _.cloneDeep(targetedOptionsTestRootJSON);
  targetedOptionsTestRootJSONWithEdits.mapOfDefaultIdDomainModel.pop();
  targetedOptionsTestRootJSONWithEdits.mapOfDefaultId$DomainModel.pop();
  graphSynchronizer.synchronize({ rootDomainNode: targetedOptionsTestRootDomainModel, rootSourceNode: targetedOptionsTestRootJSONWithEdits });

  // RESULTS VERIFICATION STAGE 2
  expect(targetedOptionsTestRootDomainModel.mapOfDefaultIdDomainModel.length).toEqual(1);
  expect(targetedOptionsTestRootDomainModel.mapOfDefaultIdDomainModel.values().next().value.id).toEqual(targetedOptionsTestRootJSONWithEdits.mapOfDefaultIdDomainModel[0].id);

  expect(targetedOptionsTestRootDomainModel.mapOfDefaultId$DomainModel.length).toEqual(1);
  expect(targetedOptionsTestRootDomainModel.mapOfDefaultId$DomainModel.values().next().value.id$).toEqual(targetedOptionsTestRootJSONWithEdits.mapOfDefaultId$DomainModel[0].id);

  // REMOVE ANOTHER ITEM & SYNC
  targetedOptionsTestRootJSONWithEdits.mapOfDefaultIdDomainModel.pop();
  targetedOptionsTestRootJSONWithEdits.mapOfDefaultId$DomainModel.pop();
  graphSynchronizer.synchronize({ rootDomainNode: targetedOptionsTestRootDomainModel, rootSourceNode: targetedOptionsTestRootJSONWithEdits });

  // RESULTS VERIFICATION STAGE 3
  expect(targetedOptionsTestRootDomainModel.mapOfDefaultIdDomainModel.length).toEqual(0);
  expect(targetedOptionsTestRootDomainModel.mapOfDefaultId$DomainModel.length).toEqual(0);

  // ADD ITEM & SYNC
  targetedOptionsTestRootJSONWithEdits.mapOfDefaultIdDomainModel.push({ id: '4A' });
  targetedOptionsTestRootJSONWithEdits.mapOfDefaultId$DomainModel.push({ id: '4B' });
  graphSynchronizer.synchronize({ rootDomainNode: targetedOptionsTestRootDomainModel, rootSourceNode: targetedOptionsTestRootJSONWithEdits });

  // RESULTS VERIFICATION STAGE 2
  expect(targetedOptionsTestRootDomainModel.mapOfDefaultIdDomainModel.length).toEqual(1);
  expect(targetedOptionsTestRootDomainModel.mapOfDefaultIdDomainModel.values().next().value.id).toEqual(targetedOptionsTestRootJSONWithEdits.mapOfDefaultIdDomainModel[0].id);

  expect(targetedOptionsTestRootDomainModel.mapOfDefaultId$DomainModel.length).toEqual(1);
  expect(targetedOptionsTestRootDomainModel.mapOfDefaultId$DomainModel.values().next().value.id$).toEqual(targetedOptionsTestRootJSONWithEdits.mapOfDefaultId$DomainModel[0].id);
});

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------

test('tryStandardPostfix works with DefaultSourceNodeKeyMakers', () => {
  const targetedOptionsTestRootDomainModel = new TargetedOptionsTestRootDomainModel();
  const graphSynchronizer = new GraphSynchronizer({
    targetedOptions: [
      { selector: { path: 'mapOfDefaultIdDomainModel' }, ignore: true },
      { selector: { path: 'mapOfDefaultId$DomainModel' }, ignore: true },
      {
        selector: { path: 'mapOfDefault_IdDomainModel' },
        domainModelCreation: {
          makeDomainModel: (sourceNode: DefaultIdSourceObject) => new DefaultId$DomainModel(),
          makeDomainNodeKey: { fromSourceNode: (sourceNode) => sourceNode.id, fromDomainModel: (domainModel) => domainModel._id },
        },
      },
    ],
    globalOptions: { tryStandardPostfix: '$' },
  });

  // POSTURE VERIFICATION
  expect(targetedOptionsTestRootDomainModel.mapOfDefaultIdDomainModel.length).toBeFalsy();
  expect(targetedOptionsTestRootDomainModel.mapOfDefaultIdDomainModel.length).toBeFalsy();

  // EXECUTE
  graphSynchronizer.synchronize({ rootDomainNode: targetedOptionsTestRootDomainModel, rootSourceNode: targetedOptionsTestRootJSON });

  // RESULTS VERIFICATION
  expect(targetedOptionsTestRootDomainModel.mapOfDefaultIdDomainModel.length).toEqual(0);
  expect(targetedOptionsTestRootDomainModel.mapOfDefaultId$DomainModel.length).toEqual(0);

  expect(targetedOptionsTestRootDomainModel.mapOfDefault_IdDomainModel.length).toEqual(targetedOptionsTestRootJSON.mapOfDefault_IdDomainModel.length);
  expect(targetedOptionsTestRootDomainModel.mapOfDefault_IdDomainModel.values().next().value.id$).toEqual(targetedOptionsTestRootJSON.mapOfDefault_IdDomainModel[0].id);
});
