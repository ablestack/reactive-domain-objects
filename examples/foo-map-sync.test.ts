import { GraphSynchronizer, IGraphSyncOptions } from '@ablestack/rdo';
import { Bar } from './supporting-files/test-source-types';
import { Logger } from '@ablestack/rdo/infrastructure/logger';

const logger = Logger.make('map-sync.test.ts');

// -----------------------------------
// Source Data
// -----------------------------------
export const fooSourceJSONWithCollection = { collectionOfBar: [{ id: 'bar-1', name: 'Bar 1' }] };

// -----------------------------------
// Reactive Domain Object Graph
// -----------------------------------
class FooDomainGraphWithCollection {
  public collectionOfBar = new Map<string, BarRDO>();
}

class BarRDO {
  public id: string = '';
  public name: string = '';
}

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------

test.only('Collection usage demo', () => {
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
