import { GraphSynchronizer, IGraphSyncOptions } from '@ablestack/rdo';
import { Logger } from '@ablestack/rdo/infrastructure/logger';
import { ListMap } from '@ablestack/rdo';

const logger = Logger.make('map-sync.test.ts');

// --------------------------------------------------------------
// MODELS & DATA
// --------------------------------------------------------------

//
// Source Data Models
type AllCollectionTypesWithObjects = {
  arrayOfObjects: (SimpleObject | undefined | null)[];
  mapOfObjects: (SimpleObject | undefined | null)[];
  setOfObjects: (SimpleObject | undefined | null)[];
  listMapOfObjects: (SimpleObject | undefined | null)[];
};

export type SimpleObject = { id: string; __type?: string };

//
// Source Data
export const allCollectionsTypesWithObjectsJSON: AllCollectionTypesWithObjects = {
  arrayOfObjects: [{ id: '1', __type: 'arrayOfObjectsObject' }, { id: '2', __type: 'arrayOfObjectsObject' }, null, undefined, { id: '3', __type: 'arrayOfObjectsObject' }],
  mapOfObjects: [{ id: '1', __type: 'arrayOfObjectsObject' }, { id: '2', __type: 'arrayOfObjectsObject' }, null, undefined, { id: '3', __type: 'arrayOfObjectsObject' }],
  setOfObjects: [{ id: '1', __type: 'arrayOfObjectsObject' }, { id: '2', __type: 'arrayOfObjectsObject' }, null, undefined, { id: '3', __type: 'arrayOfObjectsObject' }],
  listMapOfObjects: [{ id: '1', __type: 'arrayOfObjectsObject' }, { id: '2', __type: 'arrayOfObjectsObject' }, null, undefined, { id: '3', __type: 'arrayOfObjectsObject' }],
};

//
// RDO Graphs

export class AllCollectionTypesWithObjectsRDO {
  public arrayOfObjects = new Array<SimpleRDO>();
  public mapOfObjects = new Map<string, SimpleRDO>();
  public setOfObjects = new Set<SimpleRDO>();
  public listMapOfObjects = new ListMap({
    makeCollectionKey: (o: SimpleObject) => o.id,
    makeRdo: (o: SimpleRDO) => new SimpleRDO(),
  });
}

export class SimpleRDO {
  public id = '';
}

// --------------------------------------------------------------
// CONFIG
// --------------------------------------------------------------
const config: IGraphSyncOptions = {
  targetedNodeOptions: [
    {
      sourceNodeMatcher: {
        nodeContent: (sourceNode) => sourceNode && sourceNode.__type === 'arrayOfObjectsObject',
      },
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
test('Synchronize all object collection types', () => {
  const allCollectionTypesRDO = new AllCollectionTypesWithObjectsRDO();
  const graphSynchronizer = new GraphSynchronizer(config);

  console.log(' ---------------------- STAGE 1 json', allCollectionsTypesWithObjectsJSON, 'rdo', allCollectionTypesRDO);

  // POSTURE VERIFICATION
  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(0);
  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(0);
  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(0);
  expect(allCollectionTypesRDO.listMapOfObjects.size).toEqual(0);

  // INITIAL EXECUTE
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionsTypesWithObjectsJSON });

  // RESULTS VERIFICATION
  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(3);
  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(3);
  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(3);
  expect(allCollectionTypesRDO.listMapOfObjects.size).toEqual(3);

  // REMOVE ONE & ADD ONE
  allCollectionsTypesWithObjectsJSON.arrayOfObjects.pop();
  allCollectionsTypesWithObjectsJSON.arrayOfObjects.push({ id: '4', __type: 'arrayOfObjectsObject' });

  allCollectionsTypesWithObjectsJSON.listMapOfObjects.pop();
  allCollectionsTypesWithObjectsJSON.listMapOfObjects.push({ id: '4', __type: 'arrayOfObjectsObject' });

  allCollectionsTypesWithObjectsJSON.mapOfObjects.pop();
  allCollectionsTypesWithObjectsJSON.mapOfObjects.push({ id: '4', __type: 'arrayOfObjectsObject' });

  allCollectionsTypesWithObjectsJSON.setOfObjects.pop();
  allCollectionsTypesWithObjectsJSON.setOfObjects.push({ id: '4', __type: 'arrayOfObjectsObject' });

  // EXECUTE 2
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionsTypesWithObjectsJSON });

  console.log(' ---------------------- STAGE 2 json', allCollectionsTypesWithObjectsJSON, 'rdo', allCollectionTypesRDO);

  // RESULTS VERIFICATION 2
  expect(allCollectionTypesRDO.arrayOfObjects.length).toEqual(3);
  expect(allCollectionTypesRDO.arrayOfObjects.some((item) => item.id === '3')).toBe(false);
  expect(allCollectionTypesRDO.arrayOfObjects.some((item) => item.id === '4')).toBe(true);

  expect(allCollectionTypesRDO.mapOfObjects.size).toEqual(3);
  expect(Array.from(allCollectionTypesRDO.mapOfObjects.values()).some((item) => item.id === '3')).toBe(false);
  expect(Array.from(allCollectionTypesRDO.mapOfObjects.values()).some((item) => item.id === '4')).toBe(true);

  expect(allCollectionTypesRDO.setOfObjects.size).toEqual(3);
  expect(Array.from(allCollectionTypesRDO.setOfObjects.values()).some((item) => item.id === '3')).toBe(false);
  expect(Array.from(allCollectionTypesRDO.setOfObjects.values()).some((item) => item.id === '4')).toBe(true);

  expect(allCollectionTypesRDO.listMapOfObjects.size).toEqual(3);
  expect(allCollectionTypesRDO.listMapOfObjects.array$.some((item) => item.id === '3')).toBe(false);
  expect(allCollectionTypesRDO.listMapOfObjects.array$.some((item) => item.id === '4')).toBe(true);
});
