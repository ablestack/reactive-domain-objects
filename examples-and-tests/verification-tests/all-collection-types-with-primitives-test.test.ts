import { GraphSynchronizer, IGraphSyncOptions } from '@ablestack/rdo';
import { Logger } from '@ablestack/rdo/infrastructure/logger';
import { ListMap } from '@ablestack/rdo';

const logger = Logger.make('map-sync.test.ts');

// --------------------------------------------------------------
// MODELS & DATA
// --------------------------------------------------------------

//
// Source Data Models
export type AllCollectionTypesWithPrimitives = {
  arrayOfNumbers: (number | undefined | null)[];
  mapOfNumbers: (number | undefined | null)[];
  setOfNumbers: (number | undefined | null)[];
  listMapOfNumbers: (number | undefined | null)[];
};

//
// Source Data
const allCollectionsTypesWithPrimitivesJSON = {
  arrayOfNumbers: [1, 2, undefined, null, 3],
  mapOfNumbers: [1, 2, undefined, null, 3],
  setOfNumbers: [1, 2, undefined, null, 3],
  listMapOfNumbers: [1, 2, undefined, null, 3],
};

//
// RDO Graphs
export class AllCollectionTypesWithPrimitivesRdo {
  public listMapOfObjects = new ListMap<string, Number, Number>();
  public arrayOfNumbers = new Array<Number>();
  public mapOfNumbers = new Map<string, number>();
  public setOfNumbers = new Set<number>();
}

export class SimpleRDO {
  public id = '';
}

// --------------------------------------------------------------
// CONFIG
// --------------------------------------------------------------
const config: IGraphSyncOptions = {
  globalNodeOptions: { commonRdoFieldnamePostfix: '$' },
};

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------
test('Synchronize all primitive collection types', () => {
  const allCollectionTypesRDO = new AllCollectionTypesWithPrimitivesRdo();
  const graphSynchronizer = new GraphSynchronizer(config);

  // POSTURE VERIFICATION
  expect(allCollectionTypesRDO.arrayOfNumbers.length).toEqual(0);
  expect(allCollectionTypesRDO.mapOfNumbers.size).toEqual(0);
  expect(allCollectionTypesRDO.setOfNumbers.size).toEqual(0);

  // EXECUTE
  graphSynchronizer.smartSync({ rootRdo: allCollectionTypesRDO, rootSourceNode: allCollectionsTypesWithPrimitivesJSON });

  // RESULTS VERIFICATION
  expect(allCollectionTypesRDO.arrayOfNumbers.length).toEqual(3);
  expect(allCollectionTypesRDO.mapOfNumbers.size).toEqual(3);
  expect(allCollectionTypesRDO.setOfNumbers.size).toEqual(3);
});
