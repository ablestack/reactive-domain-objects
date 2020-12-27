import { GraphSynchronizer, IGraphSyncOptions } from '@ablestack/rdo';
import { Logger } from '@ablestack/rdo/infrastructure/logger';
import { ListMap } from '@ablestack/rdo';

const logger = Logger.make('map-sync.test.ts');

// --------------------------------------------------------------
// MODELS & DATA
// --------------------------------------------------------------

//
// Source Data Models
type ListMapCollectionType = {
  listMapOfObjectsById: (SimpleObject | undefined | null)[];
  listMapOfObjectsByPosition: (SimpleObject | undefined | null)[];
};

export type SimpleObject = { id: string; __type?: string; position: number };

//
// Source Data
export const listMapCollectionsWithObjectsJSON: ListMapCollectionType = {
  listMapOfObjectsById: [{ id: 'A', __type: 'arrayOfObjectsObject', position: 1 }, { id: 'B', __type: 'arrayOfObjectsObject', position: 2 }, null, undefined, { id: 'C', __type: 'arrayOfObjectsObject', position: 3 }],
  listMapOfObjectsByPosition: [{ id: 'A', __type: 'arrayOfObjectsObject', position: 1 }, { id: 'B', __type: 'arrayOfObjectsObject', position: 2 }, null, undefined, { id: 'C', __type: 'arrayOfObjectsObject', position: 3 }],
};

//
// RDO Graphs

export class ListMapCollectionRDO {
  public listMapOfObjectsById = new ListMap({
    makeCollectionKey: (o: SimpleObject) => o.id,
    makeRdo: (o: SimpleRDO) => new SimpleRDO(),
  });

  public listMapOfObjectsByPosition = new ListMap({
    makeCollectionKey: (o: SimpleObject) => o.position,
    makeRdo: (o: SimpleRDO) => new SimpleRDO(),
  });
}

export class SimpleRDO {
  public id = '';
  public position = 0;
}

// --------------------------------------------------------------
// CONFIG
// --------------------------------------------------------------
const config: IGraphSyncOptions = {
  targetedNodeOptions: [
    {
      sourceNodeMatcher: { nodeContent: (sourceNode) => sourceNode && sourceNode.__type === 'listMapOfObjectsObject' },
      makeRdo: (o: SimpleObject) => new SimpleRDO(),
    },
  ],
  globalNodeOptions: { commonRdoFieldnamePostfix: '$' },
};

// --------------------------------------------------------------
// SETUP
// --------------------------------------------------------------
beforeAll(() => {});

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test('Synchronize listmap collections', () => {
  const allCollectionTypesRDO = new ListMapCollectionRDO();
  const graphSynchronizer = new GraphSynchronizer(config);

  // POSTURE VERIFICATION
  expect(allCollectionTypesRDO.listMapOfObjectsById.size).toEqual(0);
  expect(allCollectionTypesRDO.listMapOfObjectsByPosition.size).toEqual(0);

  // EXECUTE
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: listMapCollectionsWithObjectsJSON });

  // RESULTS VERIFICATION
  expect(allCollectionTypesRDO.listMapOfObjectsById.size).toEqual(3);
  expect(allCollectionTypesRDO.listMapOfObjectsById.keys().next().value).toEqual('A');

  expect(allCollectionTypesRDO.listMapOfObjectsByPosition.size).toEqual(3);
  expect(allCollectionTypesRDO.listMapOfObjectsByPosition.keys().next().value).toEqual(1);
});
