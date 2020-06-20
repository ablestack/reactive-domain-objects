import { GraphSynchronizer, IGraphSyncOptions } from '@ablestack/rdo';
import { Logger } from '@ablestack/rdo/infrastructure/logger';

const logger = Logger.make('flat-object-sync.test.ts');

// --------------------------------------------------------------
// CONFIG
// --------------------------------------------------------------
const config: IGraphSyncOptions = {}; // No config needed for basic scenarios

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------

test('Flat object demo', () => {
  const fooRDO = new FooRDO();
  const graphSynchronizer = new GraphSynchronizer(config);

  // EXECUTE
  graphSynchronizer.smartSync({ rootRdo: fooRDO, rootSourceNode: fooSourceJSON });

  // RESULTS VERIFICATION
  expect(fooRDO.id).toEqual(fooSourceJSON.id);
  expect(fooRDO.name).toEqual(fooSourceJSON.name);
});

// --------------------------------------------------------------
// MODELS & DATA
// --------------------------------------------------------------

//
// Source Data Models
type Bar = { id: string; name: string };

//
// Source Data
export const fooSourceJSON = { id: 'foo-1', name: 'Simple Foo 1' };

//
// RDO Graphs
class FooRDO {
  public id: string = '';
  public name: string = '';
}
