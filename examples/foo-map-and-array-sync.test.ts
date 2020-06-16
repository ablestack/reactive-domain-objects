import { GraphSynchronizer, IGraphSyncOptions } from '@ablestack/rdo';
import { Bar } from './supporting-files/test-source-types';
import { Logger } from '@ablestack/rdo/infrastructure/logger';

const logger = Logger.make('map-sync.test.ts');

// -----------------------------------
// Source Data
// -----------------------------------
export const fooWithNotesSourceJSON = {
  id: 'foo-0',
  bar: { id: 'bar-0' },
  arrayOfBar: [{ id: 'bar-1' }],
  mapOfBar: [{ id: 'bar-2' }],
};

// -----------------------------------
// Reactive Domain Object Graph
// -----------------------------------
export class FooWithNotesRDO {
  // Public properties. Getters and Setters will work fine also
  public id = '';

  // Child RDOs
  public bar = new BarWithNotesRDO();

  // Collections of Child RDOs
  public arrayOfBar = new Array<BarWithNotesRDO>();
  public mapOfBar = new Map<string, BarWithNotesRDO>();

  /* Any other domain-specific properties and methods here */

  // Note, all values must be initialized to a default value on instantiation, or they will be removed by the TS -> JS compilation step and will not sync
}

export class BarWithNotesRDO {
  public id: string = '';

  /* Further nesting of RDOs or collections of RDOs here */

  /* Any other domain-specific properties and methods here */
}

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
