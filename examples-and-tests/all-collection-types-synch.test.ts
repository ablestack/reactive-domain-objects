import { Logger } from '@ablestack/rdo/infrastructure/logger';
import { Marray } from '@ablestack/rdo';
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
      sourceNodeMatcher: { nodeContent: (sourceNode) => sourceNode && sourceNode.__type === 'customCollectionOfObjectsObject' },
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
  expect(allCollectionTypesRDO.mapOfNumbers.size).toEqual(4);
  expect(allCollectionTypesRDO.setOfNumbers.size).toEqual(4);
  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(4);
  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(4);
  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(4);
  expect(allCollectionTypesRDO.customCollectionOfObjects.size).toEqual(4);

  // Mutate data
  const allCollectionSourceModelWithEdits = _.cloneDeep(allCollectionsJSON_Trio);
  allCollectionSourceModelWithEdits.arrayOfNumbers.push(4);
  allCollectionSourceModelWithEdits.mapOfNumbers.push(4);
  allCollectionSourceModelWithEdits.setOfNumbers.push(4);
  allCollectionSourceModelWithEdits.arrayOfObjects.push({ id: '4' });
  allCollectionSourceModelWithEdits.mapOfObjects.push({ id: '4' });
  allCollectionSourceModelWithEdits.setOfObjects.push({ id: '4' });
  allCollectionSourceModelWithEdits.customCollectionOfObjects.push({ id: '4' });

  // EXECUTE
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionSourceModelWithEdits });

  // RESULTS VERIFICATION

  expect(allCollectionTypesRDO.arrayOfNumbers.length).toEqual(5);
  expect(allCollectionTypesRDO.mapOfNumbers.size).toEqual(5);
  expect(allCollectionTypesRDO.setOfNumbers.size).toEqual(5);
  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(5);
  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(5);
  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(5);
  expect(allCollectionTypesRDO.customCollectionOfObjects.size).toEqual(5);
});

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test.only('Synchronize collection removals', () => {
  const allCollectionTypesRDO = new AllCollectionTypesRDO();
  const graphSynchronizer = new GraphSynchronizer(config);

  // SETUP
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionsJSON_Trio });

  // POSTURE VERIFICATION
  expect(allCollectionTypesRDO.arrayOfNumbers.length).toEqual(4);
  expect(allCollectionTypesRDO.mapOfNumbers.size).toEqual(4);
  expect(allCollectionTypesRDO.setOfNumbers.size).toEqual(4);
  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(4);
  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(4);
  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(4);
  expect(allCollectionTypesRDO.customCollectionOfObjects.size).toEqual(4);

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
  expect(allCollectionTypesRDO.arrayOfNumbers.length).toEqual(3);
  expect(allCollectionTypesRDO.mapOfNumbers.size).toEqual(3);
  expect(allCollectionTypesRDO.setOfNumbers.size).toEqual(3);
  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(3);
  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(3);
  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(3);
  expect(allCollectionTypesRDO.customCollectionOfObjects.size).toEqual(3);
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
  const graphSynchronizer = new GraphSynchronizer(config);

  // SETUP
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionsJSON_Trio });

  // POSTURE VERIFICATION
  expect(allCollectionTypesRDO.arrayOfNumbers.length).toEqual(4);
  expect(allCollectionTypesRDO.mapOfNumbers.size).toEqual(4);
  expect(allCollectionTypesRDO.setOfNumbers.size).toEqual(4);
  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(4);
  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(4);
  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(4);
  expect(allCollectionTypesRDO.customCollectionOfObjects.size).toEqual(4);

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
  expect(allCollectionTypesRDO.arrayOfNumbers.find((item) => item === 4)).toEqual(5);
  expect(allCollectionTypesRDO.mapOfNumbers.get(4)).toEqual(5);
  expect(allCollectionTypesRDO.mapOfNumbers.get(1)).toBeUndefined();
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
  const graphSynchronizer = new GraphSynchronizer(config);

  // SETUP
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionsJSON_Trio });

  // POSTURE VERIFICATION
  expect(allCollectionTypesRDO.arrayOfNumbers.length).toEqual(4);
  expect(allCollectionTypesRDO.mapOfNumbers.size).toEqual(4);
  expect(allCollectionTypesRDO.setOfNumbers.size).toEqual(4);
  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(4);
  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(4);
  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(4);
  expect(allCollectionTypesRDO.customCollectionOfObjects.size).toEqual(4);

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

  expect(allCollectionTypesRDO.arrayOfNumbers.find((item) => item === 4)).toEqual(5);
  expect(allCollectionTypesRDO.mapOfNumbers.get(4)).toEqual(5);
  expect(allCollectionTypesRDO.mapOfNumbers.get(1)).toBeUndefined();
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

  customCollectionOfNumbers: (number | undefined | null)[];
  customCollectionOfObjects: (SimpleObject | undefined | null)[];
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
  customCollectionOfNumbers: [1, 2, 2, undefined, null, 3],
  customCollectionOfObjects: [{ id: '1', __type: 'arrayOfObjectsObject' }, { id: '2', __type: 'arrayOfObjectsObject' }, { id: '2', __type: 'arrayOfObjectsObject' }, null, undefined, { id: '3', __type: 'arrayOfObjectsObject' }],
};

export const allCollectionsJSON_Uno: AllCollections = {
  arrayOfNumbers: [1],
  arrayOfObjects: [{ id: '1', __type: 'arrayOfObjectsObject' }],
  mapOfNumbers: [1],
  mapOfObjects: [{ id: '1', __type: 'mapOfObjectsObject' }],
  setOfNumbers: [1],
  setOfObjects: [{ id: '1', __type: 'setOfObjectsObject' }],
  customCollectionOfNumbers: [1],
  customCollectionOfObjects: [{ id: '1', __type: 'customCollectionOfObjectsObject' }],
};

//
// RDO Graphs
export class AllCollectionTypesRDO {
  public arrayOfObjects = new Array<SimpleRDO>();
  public mapOfObjects = new Map<string, SimpleRDO>();
  public setOfObjects = new Set<SimpleRDO>();
  public customCollectionOfObjects = new Marray({
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
