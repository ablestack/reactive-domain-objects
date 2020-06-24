import { GraphSynchronizer, IContinueSmartSync, ICustomSync, IMakeRdo, IRdoNodeWrapper, IGraphSyncOptions } from '@ablestack/rdo';
import { Logger } from '@ablestack/rdo/infrastructure/logger';

const logger = Logger.make('custom-sync.test.ts');

// --------------------------------------------------------------
// CONFIG
// --------------------------------------------------------------
const config: IGraphSyncOptions = {
  targetedNodeOptions: [
    { sourceNodeMatcher: { nodePath: 'bar/mapOfBaz' }, makeRdo: (sourceNode: Baz) => new BazRdo() },
    { sourceNodeMatcher: { nodePath: 'bar/baz/mapOfFred' }, makeRdo: (sourceNode: Fred) => new FredRdo() },
    { sourceNodeMatcher: { nodePath: 'bar/mapOfBaz/mapOfFred' }, makeRdo: (sourceNode: Fred) => new FredRdo() },
  ],
};

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------

test('Simple usage demo with notes', () => {
  const fooRdo = new FooRdo();
  const graphSynchronizer = new GraphSynchronizer(config);

  // POSTURE VERIFICATION
  expect(fooRdo.bar.mapOfBazzz.size).toBeFalsy();

  // EXECUTE
  graphSynchronizer.smartSync({ rootRdo: fooRdo, rootSourceNode: fooSourceJson });

  // RESULTS VERIFICATION
  expect(fooRdo.id).toEqual(fooSourceJson.id);
  expect(fooRdo.bar.id).toEqual(`custom-id-${fooSourceJson.bar.id}`);
  expect(fooRdo.bar.mapOfBazzz.size).toEqual(fooSourceJson.bar.mapOfBaz.length);
  expect(Array.from(fooRdo.bar.mapOfBazzz.values())[0].id).toEqual(fooSourceJson.bar.mapOfBaz[0].id);

  expect(Array.from(fooRdo.bar.mapOfBazzz.values())[0].mapOfFred.size).toEqual(fooSourceJson.bar.mapOfBaz[0].mapOfFred.length);
  expect(Array.from(Array.from(fooRdo.bar.mapOfBazzz.values())[0].mapOfFred.values())[0].id).toEqual(fooSourceJson.bar.mapOfBaz[0].mapOfFred[0].id);
});

// --------------------------------------------------------------
// MODELS & DATA
// --------------------------------------------------------------

//
// Source Data Models
type Foo = { id: string; bar: Bar };
type Bar = { id: string; baz: Baz; mapOfBaz: Map<string, Baz> };
type Baz = { id: string; fred: Fred; mapOfFred: Map<string, Fred> };
type Fred = { id: string };

//
// Source Data
export const fooSourceJson = {
  id: 'foo-0',
  bar: {
    id: 'bar-0',
    baz: {
      id: 'bar-0-baz-0',
      fred: { id: 'bar-0-baz-0-fred-0' },
      mapOfFred: [{ id: 'bar-0-baz-0-fred-1' }, { id: 'bar-0-baz-0-fred-2' }],
    },
    mapOfBaz: [
      {
        id: 'bar-0-baz-1',
        fred: { id: 'bar-0-baz-1-fred-0' },
        mapOfFred: [{ id: 'bar-0-baz-1-fred-1' }, { id: 'bar-0-baz-1-fred-2' }],
      },
    ],
  },
};

//
// RDO Graphs
export class FooRdo {
  public id = '';
  public bar = new CustomSyncBarRDO();
}

export class CustomSyncBarRDO implements ICustomSync<Bar> {
  public id: string = '';
  public bazzz = new BazRdo();
  public mapOfBazzz = new Map<string, BazRdo>();

  public synchronizeState({ sourceObject, continueSmartSync }: { sourceObject: Bar; continueSmartSync: IContinueSmartSync }) {
    this.id = `custom-id-${sourceObject.id}`;

    // sync bazzz
    continueSmartSync({ sourceNodeItemKey: 'baz', sourceItemValue: sourceObject, rdoNodeItemKey: 'bazzz', rdoNodeItemValue: this.bazzz });

    // sync mapOfBazz
    continueSmartSync({ sourceNodeItemKey: 'mapOfBaz', sourceItemValue: sourceObject, rdoNodeItemKey: 'mapOfBazzz', rdoNodeItemValue: this.mapOfBazzz });

    return false;
  }
}

export class BazRdo {
  public id = '';
  public fred = new FredRdo();
  public mapOfFred = new Map<string, FredRdo>();
}

export class FredRdo {
  public id = '';
}
