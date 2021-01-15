import { Logger } from '@ablestack/rdo/infrastructure/logger';
import { ListMap } from '@ablestack/rdo';
import { GraphSynchronizer, IGraphSyncOptions } from '@ablestack/rdo';
import _ from 'lodash';

const logger = Logger.make('map-sync.test.ts');

// --------------------------------------------------------------
// CONFIG
// --------------------------------------------------------------
const config: IGraphSyncOptions = {
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
      sourceNodeMatcher: { nodeContent: (sourceNode) => sourceNode && sourceNode.__type === 'listMapOfObjectsObject' },
      makeRdo: (o: SimpleObject) => new SimpleRDO(),
    },
  ],
  globalNodeOptions: { commonRdoFieldnamePostfix: '$' },
};

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test('Synchronize collection additions', () => {
  const allCollectionTypesRDO = new AllCollectionTypesRDO();
  const graphSynchronizer = new GraphSynchronizer(config);

  // SETUP
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionsJSON_Trio });

  // POSTURE VERIFICATION
  expect(allCollectionTypesRDO.arrayOfNumbers.length).toEqual(4);
  expect(allCollectionTypesRDO.mapOfNumbers.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(allCollectionTypesRDO.setOfNumbers.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(4);
  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(allCollectionTypesRDO.listMapOfObjects.size).toEqual(3); // one less than array, as doesn't accept duplicates

  // Make sure array of objects duplicate item has synced contents (added due to found bug)
  expect(allCollectionTypesRDO.arrayOfObjects[2].id).toEqual('2');

  // Mutate data
  const allCollectionSourceModelWithEdits = _.cloneDeep(allCollectionsJSON_Trio);
  allCollectionSourceModelWithEdits.arrayOfNumbers.push(4);
  allCollectionSourceModelWithEdits.mapOfNumbers.push(4);
  allCollectionSourceModelWithEdits.setOfNumbers.push(4);
  allCollectionSourceModelWithEdits.arrayOfObjects.push({ id: '4', __type: 'arrayOfObjectsObject' });
  allCollectionSourceModelWithEdits.mapOfObjects.push({ id: '4', __type: 'arrayOfObjectsObject' });
  allCollectionSourceModelWithEdits.setOfObjects.push({ id: '4', __type: 'arrayOfObjectsObject' });
  allCollectionSourceModelWithEdits.listMapOfObjects.push({ id: '4', __type: 'arrayOfObjectsObject' });

  // EXECUTE
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionSourceModelWithEdits });

  // RESULTS VERIFICATION
  expect(allCollectionTypesRDO.arrayOfNumbers.length).toEqual(5);
  expect(allCollectionTypesRDO.arrayOfNumbers[4]).toEqual(4);

  expect(allCollectionTypesRDO.mapOfNumbers.size).toEqual(4); // one less than array, as doesn't accept duplicates
  expect(Array.from(allCollectionTypesRDO.mapOfNumbers.values()).some((item) => item === 4)).toBe(true); // one less than array, as doesn't accept duplicates

  expect(allCollectionTypesRDO.setOfNumbers.size).toEqual(4); // one less than array, as doesn't accept duplicates
  expect(Array.from(allCollectionTypesRDO.setOfNumbers.values()).some((item) => item === 4)).toBe(true);

  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(5);
  expect(allCollectionTypesRDO.arrayOfObjects.some((item) => item.id === '4')).toBe(true);

  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(4); // one less than array, as doesn't accept duplicates
  expect(Array.from(allCollectionTypesRDO.mapOfObjects.values()).some((item) => item.id === '4')).toBe(true);

  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(4); // one less than array, as doesn't accept duplicates
  expect(Array.from(allCollectionTypesRDO.setOfObjects.values()).some((item) => item.id === '4')).toBe(true);

  expect(allCollectionTypesRDO.listMapOfObjects.size).toEqual(4); // one less than array, as doesn't accept duplicates
  expect(allCollectionTypesRDO.listMapOfObjects.array$.some((item) => item.id === '4')).toBe(true);
});

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test('Synchronize collection removals', () => {
  const allCollectionTypesRDO = new AllCollectionTypesRDO();
  const graphSynchronizer = new GraphSynchronizer(config);

  // SETUP
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionsJSON_Trio });

  // POSTURE VERIFICATION
  expect(allCollectionTypesRDO.arrayOfNumbers.length).toEqual(4);
  expect(allCollectionTypesRDO.mapOfNumbers.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(allCollectionTypesRDO.setOfNumbers.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(4);
  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(allCollectionTypesRDO.listMapOfObjects.size).toEqual(3); // one less than array, as doesn't accept duplicates

  // EXECUTE
  // Mutate data
  const allCollectionSourceModelWithEdits = _.cloneDeep(allCollectionsJSON_Trio);
  allCollectionSourceModelWithEdits.arrayOfNumbers.pop();
  allCollectionSourceModelWithEdits.mapOfNumbers.pop();
  allCollectionSourceModelWithEdits.setOfNumbers.pop();
  allCollectionSourceModelWithEdits.arrayOfObjects.pop();
  allCollectionSourceModelWithEdits.mapOfObjects.pop();
  allCollectionSourceModelWithEdits.setOfObjects.pop();
  allCollectionSourceModelWithEdits.listMapOfObjects.pop();

  // RESULTS VERIFICATION
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionSourceModelWithEdits });
  expect(allCollectionTypesRDO.arrayOfNumbers.length).toEqual(3);
  expect(allCollectionTypesRDO.mapOfNumbers.size).toEqual(2); // one less than array, as doesn't accept duplicates
  expect(allCollectionTypesRDO.setOfNumbers.size).toEqual(2); // one less than array, as doesn't accept duplicates
  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(3);
  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(2); // one less than array, as doesn't accept duplicates
  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(2); // one less than array, as doesn't accept duplicates
  expect(allCollectionTypesRDO.listMapOfObjects.size).toEqual(2); // one less than array, as doesn't accept duplicates
});

// --------------------------------------------------------------
// Addition and Removal
// --------------------------------------------------------------
test('Synchronize collection additions and removal - multiple times', () => {
  const allCollectionTypesRDO = new AllCollectionTypesRDO();
  const graphSynchronizer = new GraphSynchronizer(config);

  // ---------------------------------------------------------------------------------------------------------------------
  // SETUP
  // ---------------------------------------------------------------------------------------------------------------------
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionsJSON_Trio });

  // POSTURE VERIFICATION
  expect(allCollectionTypesRDO.arrayOfNumbers.length).toEqual(4);
  expect(allCollectionTypesRDO.mapOfNumbers.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(allCollectionTypesRDO.setOfNumbers.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(4);
  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(allCollectionTypesRDO.listMapOfObjects.size).toEqual(3); // one less than array, as doesn't accept duplicates

  // Make sure array of objects duplicate item has synced contents (added due to found bug)
  expect(allCollectionTypesRDO.arrayOfObjects[2].id).toEqual('2');

  // ---------------------------------------------------------------------------------------------------------------------
  // Round I - Mutate data
  // ---------------------------------------------------------------------------------------------------------------------
  const allCollectionSourceModelWithEditsI = _.cloneDeep(allCollectionsJSON_Trio);
  allCollectionSourceModelWithEditsI.arrayOfNumbers.pop();
  allCollectionSourceModelWithEditsI.arrayOfNumbers.push(4);

  allCollectionSourceModelWithEditsI.mapOfNumbers.pop();
  allCollectionSourceModelWithEditsI.mapOfNumbers.push(4);

  allCollectionSourceModelWithEditsI.setOfNumbers.pop();
  allCollectionSourceModelWithEditsI.setOfNumbers.push(4);

  allCollectionSourceModelWithEditsI.arrayOfObjects.pop();
  allCollectionSourceModelWithEditsI.arrayOfObjects.push({ id: '4', __type: 'arrayOfObjectsObject' });

  allCollectionSourceModelWithEditsI.mapOfObjects.pop();
  allCollectionSourceModelWithEditsI.mapOfObjects.push({ id: '4', __type: 'arrayOfObjectsObject' });

  allCollectionSourceModelWithEditsI.setOfObjects.pop();
  allCollectionSourceModelWithEditsI.setOfObjects.push({ id: '4', __type: 'arrayOfObjectsObject' });

  allCollectionSourceModelWithEditsI.listMapOfObjects.pop();
  allCollectionSourceModelWithEditsI.listMapOfObjects.push({ id: '4', __type: 'arrayOfObjectsObject' });

  // EXECUTE
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionSourceModelWithEditsI });

  // RESULTS VERIFICATION
  expect(allCollectionTypesRDO.arrayOfNumbers.length).toEqual(4);
  expect(allCollectionTypesRDO.arrayOfNumbers.some((item) => item === 3)).toEqual(false);
  expect(allCollectionTypesRDO.arrayOfNumbers.some((item) => item === 4)).toEqual(true);

  expect(allCollectionTypesRDO.mapOfNumbers.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(Array.from(allCollectionTypesRDO.mapOfNumbers.values()).some((item) => item === 3)).toBe(false); // one less than array, as doesn't accept duplicates
  expect(Array.from(allCollectionTypesRDO.mapOfNumbers.values()).some((item) => item === 4)).toBe(true); // one less than array, as doesn't accept duplicates

  expect(allCollectionTypesRDO.setOfNumbers.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(Array.from(allCollectionTypesRDO.setOfNumbers.values()).some((item) => item === 3)).toBe(false);
  expect(Array.from(allCollectionTypesRDO.setOfNumbers.values()).some((item) => item === 4)).toBe(true);

  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(4);
  expect(allCollectionTypesRDO.arrayOfObjects.some((item) => item.id === '3')).toBe(false);
  expect(allCollectionTypesRDO.arrayOfObjects.some((item) => item.id === '4')).toBe(true);

  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(Array.from(allCollectionTypesRDO.mapOfObjects.values()).some((item) => item.id === '3')).toBe(false);
  expect(Array.from(allCollectionTypesRDO.mapOfObjects.values()).some((item) => item.id === '4')).toBe(true);

  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(Array.from(allCollectionTypesRDO.setOfObjects.values()).some((item) => item.id === '3')).toBe(false);
  expect(Array.from(allCollectionTypesRDO.setOfObjects.values()).some((item) => item.id === '4')).toBe(true);

  expect(allCollectionTypesRDO.listMapOfObjects.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(allCollectionTypesRDO.listMapOfObjects.array$.some((item) => item.id === '3')).toBe(false);
  expect(allCollectionTypesRDO.listMapOfObjects.array$.some((item) => item.id === '4')).toBe(true);

  // ---------------------------------------------------------------------------------------------------------------------
  // Round II - Mutate data
  // ---------------------------------------------------------------------------------------------------------------------
  const allCollectionSourceModelWithEditsII = _.cloneDeep(allCollectionSourceModelWithEditsI);
  allCollectionSourceModelWithEditsII.arrayOfNumbers.pop();
  allCollectionSourceModelWithEditsII.arrayOfNumbers.push(5);

  allCollectionSourceModelWithEditsII.mapOfNumbers.pop();
  allCollectionSourceModelWithEditsII.mapOfNumbers.push(5);

  allCollectionSourceModelWithEditsII.setOfNumbers.pop();
  allCollectionSourceModelWithEditsII.setOfNumbers.push(5);

  allCollectionSourceModelWithEditsII.arrayOfObjects.pop();
  allCollectionSourceModelWithEditsII.arrayOfObjects.push({ id: '5', __type: 'arrayOfObjectsObject' });

  allCollectionSourceModelWithEditsII.mapOfObjects.pop();
  allCollectionSourceModelWithEditsII.mapOfObjects.push({ id: '5', __type: 'arrayOfObjectsObject' });

  allCollectionSourceModelWithEditsII.setOfObjects.pop();
  allCollectionSourceModelWithEditsII.setOfObjects.push({ id: '5', __type: 'arrayOfObjectsObject' });

  allCollectionSourceModelWithEditsII.listMapOfObjects.pop();
  allCollectionSourceModelWithEditsII.listMapOfObjects.push({ id: '5', __type: 'arrayOfObjectsObject' });

  console.log('allCollectionSourceModelWithEdits - II', allCollectionSourceModelWithEditsII);

  // EXECUTE
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionSourceModelWithEditsII });

  // RESULTS VERIFICATION
  expect(allCollectionTypesRDO.arrayOfNumbers.length).toEqual(4);
  expect(allCollectionTypesRDO.arrayOfNumbers.some((item) => item === 3)).toEqual(false);
  expect(allCollectionTypesRDO.arrayOfNumbers.some((item) => item === 4)).toEqual(false);
  expect(allCollectionTypesRDO.arrayOfNumbers.some((item) => item === 5)).toEqual(true);

  expect(allCollectionTypesRDO.mapOfNumbers.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(Array.from(allCollectionTypesRDO.mapOfNumbers.values()).some((item) => item === 3)).toBe(false); // one less than array, as doesn't accept duplicates
  expect(Array.from(allCollectionTypesRDO.mapOfNumbers.values()).some((item) => item === 4)).toBe(false); // one less than array, as doesn't accept duplicates
  expect(Array.from(allCollectionTypesRDO.mapOfNumbers.values()).some((item) => item === 5)).toBe(true); // one less than array, as doesn't accept duplicates

  expect(allCollectionTypesRDO.setOfNumbers.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(Array.from(allCollectionTypesRDO.setOfNumbers.values()).some((item) => item === 3)).toBe(false);
  expect(Array.from(allCollectionTypesRDO.setOfNumbers.values()).some((item) => item === 4)).toBe(false);
  expect(Array.from(allCollectionTypesRDO.setOfNumbers.values()).some((item) => item === 5)).toBe(true);

  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(4);
  expect(allCollectionTypesRDO.arrayOfObjects.some((item) => item.id === '3')).toBe(false);
  expect(allCollectionTypesRDO.arrayOfObjects.some((item) => item.id === '4')).toBe(false);
  expect(allCollectionTypesRDO.arrayOfObjects.some((item) => item.id === '5')).toBe(true);

  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(Array.from(allCollectionTypesRDO.mapOfObjects.values()).some((item) => item.id === '3')).toBe(false);
  expect(Array.from(allCollectionTypesRDO.mapOfObjects.values()).some((item) => item.id === '4')).toBe(false);
  expect(Array.from(allCollectionTypesRDO.mapOfObjects.values()).some((item) => item.id === '5')).toBe(true);

  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(Array.from(allCollectionTypesRDO.setOfObjects.values()).some((item) => item.id === '3')).toBe(false);
  expect(Array.from(allCollectionTypesRDO.setOfObjects.values()).some((item) => item.id === '4')).toBe(false);
  expect(Array.from(allCollectionTypesRDO.setOfObjects.values()).some((item) => item.id === '5')).toBe(true);

  expect(allCollectionTypesRDO.listMapOfObjects.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(allCollectionTypesRDO.listMapOfObjects.array$.some((item) => item.id === '3')).toBe(false);
  expect(allCollectionTypesRDO.listMapOfObjects.array$.some((item) => item.id === '4')).toBe(false);
  expect(allCollectionTypesRDO.listMapOfObjects.array$.some((item) => item.id === '5')).toBe(true);
});

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test('Synchronize collection removals - down to zero - with sourceNodeMatcher targeted configuration', () => {
  const allCollectionTypesRDO = new AllCollectionTypesRDO();
  const graphSynchronizer = new GraphSynchronizer(config);

  // SETUP
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionsJSON_Uno });

  // POSTURE VERIFICATION
  expect(allCollectionTypesRDO.arrayOfNumbers.length).toEqual(1);
  expect(allCollectionTypesRDO.mapOfNumbers.size).toEqual(1);
  expect(allCollectionTypesRDO.setOfNumbers.size).toEqual(1);
  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(1);
  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(1);
  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(1);
  expect(allCollectionTypesRDO.listMapOfObjects.size).toEqual(1);

  // EXECUTE
  // Mutate data
  const allCollectionSourceModelWithEdits = _.cloneDeep(allCollectionsJSON_Uno);
  allCollectionSourceModelWithEdits.arrayOfNumbers.pop();
  allCollectionSourceModelWithEdits.mapOfNumbers.pop();
  allCollectionSourceModelWithEdits.setOfNumbers.pop();
  allCollectionSourceModelWithEdits.arrayOfObjects.pop();
  allCollectionSourceModelWithEdits.mapOfObjects.pop();
  allCollectionSourceModelWithEdits.setOfObjects.pop();
  allCollectionSourceModelWithEdits.listMapOfObjects.pop();

  // RESULTS VERIFICATION
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionSourceModelWithEdits });
  expect(allCollectionTypesRDO.arrayOfNumbers.length).toEqual(0);
  expect(allCollectionTypesRDO.mapOfNumbers.size).toEqual(0);
  expect(allCollectionTypesRDO.setOfNumbers.size).toEqual(0);
  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(0);
  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(0);
  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(0);
  expect(allCollectionTypesRDO.listMapOfObjects.size).toEqual(0);
});

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test('Synchronize collection element edit', () => {
  const allCollectionTypesRDO = new AllCollectionTypesRDO();
  const graphSynchronizer = new GraphSynchronizer(config);

  // SETUP
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionsJSON_Trio });

  // POSTURE VERIFICATION
  expect(allCollectionTypesRDO.arrayOfNumbers.length).toEqual(4);
  expect(allCollectionTypesRDO.mapOfNumbers.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(allCollectionTypesRDO.setOfNumbers.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(4);
  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(allCollectionTypesRDO.listMapOfObjects.size).toEqual(3); // one less than array, as doesn't accept duplicates

  // Mutate data
  const allCollectionSourceModelWithEdits = _.cloneDeep(allCollectionsJSON_Trio);
  allCollectionSourceModelWithEdits.arrayOfNumbers[0] = 4;
  allCollectionSourceModelWithEdits.mapOfNumbers[0] = 4;
  allCollectionSourceModelWithEdits.setOfNumbers[0] = 4;
  allCollectionSourceModelWithEdits.arrayOfObjects[0]!.id = '4';
  allCollectionSourceModelWithEdits.mapOfObjects[0]!.id = '4';
  allCollectionSourceModelWithEdits.setOfObjects[0]!.id = '4';
  allCollectionSourceModelWithEdits.listMapOfObjects[0]!.id = '4';

  // EXECUTE
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionSourceModelWithEdits });

  console.log('allCollectionTypesRDO.arrayOfObjects', allCollectionTypesRDO.arrayOfObjects);

  // RESULTS VERIFICATION
  expect(allCollectionTypesRDO.arrayOfNumbers.find((item) => item === 4)).toEqual(4);
  expect(allCollectionTypesRDO.mapOfNumbers.get(4)).toEqual(4);
  expect(allCollectionTypesRDO.mapOfNumbers.get(1)).toBeUndefined();
  expect(allCollectionTypesRDO.setOfNumbers.has(4)).toBeTruthy();
  expect(allCollectionTypesRDO.setOfNumbers.has(1)).not.toBeTruthy();
  expect(allCollectionTypesRDO.arrayOfObjects.find((item) => item.id === '4')).toBeTruthy();
  expect(allCollectionTypesRDO.mapOfObjects.get('4')?.id).toEqual('4');
  expect(allCollectionTypesRDO.mapOfObjects.get('1')).toBeUndefined();
  expect(Array.from(allCollectionTypesRDO.setOfObjects.values()).find((item) => item.id === '4')).toBeDefined();
  expect(Array.from(allCollectionTypesRDO.setOfObjects.values()).find((item) => item.id === '1')).toBeUndefined();
  expect(allCollectionTypesRDO.listMapOfObjects.get('4')?.id).toEqual('4');
  expect(allCollectionTypesRDO.listMapOfObjects.get('1')).toBeUndefined();
});

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test('Synchronize collection element - handle null value edits', () => {
  const allCollectionTypesRDO = new AllCollectionTypesRDO();
  const graphSynchronizer = new GraphSynchronizer(config);

  // SETUP
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionsJSON_Trio });

  // POSTURE VERIFICATION
  expect(allCollectionTypesRDO.arrayOfNumbers.length).toEqual(4);
  expect(allCollectionTypesRDO.mapOfNumbers.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(allCollectionTypesRDO.setOfNumbers.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(4);
  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(3); // one less than array, as doesn't accept duplicates
  expect(allCollectionTypesRDO.listMapOfObjects.size).toEqual(3); // one less than array, as doesn't accept duplicates

  // EXECUTE
  // Mutate data
  const allCollectionSourceModelWithEdits = _.cloneDeep(allCollectionsJSON_Trio);
  allCollectionSourceModelWithEdits.arrayOfNumbers[0] = null;
  allCollectionSourceModelWithEdits.mapOfNumbers[0] = null;
  allCollectionSourceModelWithEdits.setOfNumbers[0] = null;
  allCollectionSourceModelWithEdits.arrayOfObjects[0] = (null as unknown) as any;
  allCollectionSourceModelWithEdits.mapOfObjects[0] = (null as unknown) as any;
  allCollectionSourceModelWithEdits.setOfObjects[0] = (null as unknown) as any;
  allCollectionSourceModelWithEdits.listMapOfObjects[0] = (null as unknown) as any;

  // RESULTS VERIFICATION
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionSourceModelWithEdits });

  expect(allCollectionTypesRDO.arrayOfNumbers.find((item) => item === 2)).toEqual(2);
  expect(allCollectionTypesRDO.mapOfNumbers.get(2)).toEqual(2);
  expect(allCollectionTypesRDO.mapOfNumbers.get(1)).toBeUndefined();
  expect(allCollectionTypesRDO.setOfNumbers.has(2)).toBeTruthy();
  expect(allCollectionTypesRDO.setOfNumbers.has(1)).not.toBeTruthy();
  expect(allCollectionTypesRDO.arrayOfObjects.find((item) => item.id === '2')).toBeTruthy();
  expect(allCollectionTypesRDO.mapOfObjects.get('2')?.id).toEqual('2');
  expect(allCollectionTypesRDO.mapOfObjects.get('1')).toBeUndefined();
  expect(Array.from(allCollectionTypesRDO.setOfObjects.values()).find((item) => item.id === '2')).toBeDefined();
  expect(Array.from(allCollectionTypesRDO.setOfObjects.values()).find((item) => item.id === '1')).toBeUndefined();
  expect(allCollectionTypesRDO.listMapOfObjects.get('2')?.id).toEqual('2');
  expect(allCollectionTypesRDO.listMapOfObjects.get('1')).toBeUndefined();
});

// --------------------------------------------------------------
// MODELS & DATA
// --------------------------------------------------------------

//
// Source Data Models
export type AllCollections = {
  arrayOfNumbers: (number | undefined | null)[];
  arrayOfObjects: (SimpleObject | undefined | null)[];

  mapOfNumbers: (number | undefined | null)[];
  mapOfObjects: (SimpleObject | undefined | null)[];

  setOfNumbers: (number | undefined | null)[];
  setOfObjects: (SimpleObject | undefined | null)[];

  listMapOfNumbers: (number | undefined | null)[];
  listMapOfObjects: (SimpleObject | undefined | null)[];
};

export type SimpleObject = { id: string; __type?: string };

//
// Source Data
export const allCollectionsJSON_Trio: AllCollections = {
  arrayOfNumbers: [1, 2, 2, undefined, null, 3],
  arrayOfObjects: [{ id: '1', __type: 'arrayOfObjectsObject' }, { id: '2', __type: 'arrayOfObjectsObject' }, { id: '2', __type: 'arrayOfObjectsObject' }, null, undefined, { id: '3', __type: 'arrayOfObjectsObject' }],
  mapOfNumbers: [1, 2, 2, undefined, null, 3],
  mapOfObjects: [{ id: '1', __type: 'arrayOfObjectsObject' }, { id: '2', __type: 'arrayOfObjectsObject' }, { id: '2', __type: 'arrayOfObjectsObject' }, null, undefined, { id: '3', __type: 'arrayOfObjectsObject' }],
  setOfNumbers: [1, 2, 2, undefined, null, 3],
  setOfObjects: [{ id: '1', __type: 'arrayOfObjectsObject' }, { id: '2', __type: 'arrayOfObjectsObject' }, { id: '2', __type: 'arrayOfObjectsObject' }, null, undefined, { id: '3', __type: 'arrayOfObjectsObject' }],
  listMapOfNumbers: [1, 2, 2, undefined, null, 3],
  listMapOfObjects: [{ id: '1', __type: 'arrayOfObjectsObject' }, { id: '2', __type: 'arrayOfObjectsObject' }, { id: '2', __type: 'arrayOfObjectsObject' }, null, undefined, { id: '3', __type: 'arrayOfObjectsObject' }],
};

export const allCollectionsJSON_Uno: AllCollections = {
  arrayOfNumbers: [1],
  arrayOfObjects: [{ id: '1', __type: 'arrayOfObjectsObject' }],
  mapOfNumbers: [1],
  mapOfObjects: [{ id: '1', __type: 'mapOfObjectsObject' }],
  setOfNumbers: [1],
  setOfObjects: [{ id: '1', __type: 'setOfObjectsObject' }],
  listMapOfNumbers: [1],
  listMapOfObjects: [{ id: '1', __type: 'listMapOfObjectsObject' }],
};

//
// RDO Graphs
export class AllCollectionTypesRDO {
  public arrayOfObjects = new Array<SimpleRDO>();
  public mapOfObjects = new Map<string, SimpleRDO>();
  public setOfObjects = new Set<SimpleRDO>();
  public listMapOfObjects = new ListMap({
    makeCollectionKey: (o: SimpleObject) => o.id,
    makeRdo: (o: SimpleRDO) => new SimpleRDO(),
  });
  public arrayOfNumbers = new Array<number>();
  public mapOfNumbers = new Map<number, number>();
  public setOfNumbers = new Set<number>();
}

export class SimpleRDO {
  public id = '';
}
