import { GraphSynchronizer, IGraphSyncOptions } from '@ablestack/rdo';
import { Logger } from '@ablestack/rdo/infrastructure/logger';

const logger = Logger.make('map-sync.test.ts');

// --------------------------------------------------------------
// CONFIG
// --------------------------------------------------------------
const config: IGraphSyncOptions = {
  targetedNodeOptions: [{ sourceNodeMatcher: { nodePath: 'collectionOfBar' }, makeRdo: (sourceNode: Bar) => new BarRDO() }],
};

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------

test('Collection usage demo', () => {
  const fooRDO = new FooDomainGraphWithCollection();
  const graphSynchronizer = new GraphSynchronizer(config);

  // EXECUTE
  graphSynchronizer.smartSync({ rootRdo: fooRDO, rootSourceNode: fooSourceJSONWithCollection });

  // RESULTS VERIFICATION
  expect(fooRDO.collectionOfBar.size).toEqual(fooSourceJSONWithCollection.collectionOfBar.length);
  expect(fooRDO.collectionOfBar.values().next().value.id).toEqual(fooSourceJSONWithCollection.collectionOfBar[0].id);
});

// --------------------------------------------------------------
// MODELS & DATA
// --------------------------------------------------------------

//
// Source Data Models
type Bar = { id: string; name: string };

//
// Source Data
const fooSourceJSONWithCollection = { collectionOfBar: [{ id: 'bar-1', name: 'Bar 1' }] };

//
// RDO Graphs
class FooDomainGraphWithCollection {
  public collectionOfBar = new Map<string, BarRDO>();
}

class BarRDO {
  public id: string = '';
  public name: string = '';
}
