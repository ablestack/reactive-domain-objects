import { GraphSynchronizer } from '@ablestack/rdo';
import { Logger } from '@ablestack/rdo/infrastructure/logger';
import _ from 'lodash';

const logger = Logger.make('flat-object-sync.test.ts');

// -----------------------------------
// Source Data Models
// -----------------------------------
export type DefaultIdSourceObject = { id: string };
export type PropNameTestRoot = { mapOfDefaultIdRDO: DefaultIdSourceObject[]; mapOfDefaultId$RDO: DefaultIdSourceObject[]; mapOfDefault_IdRDO: DefaultIdSourceObject[] };

// -----------------------------------
// Source Data
// -----------------------------------
export const targetedNodeOptionsTestRootJSON: PropNameTestRoot = {
  mapOfDefaultIdRDO: [{ id: '1A' }, { id: '1B' }],
  mapOfDefaultId$RDO: [{ id: '2A' }, { id: '2B' }],
  mapOfDefault_IdRDO: [{ id: '3A' }, { id: '3B' }],
};

// -----------------------------------
// Reactive Domain Object Graph
// -----------------------------------
export class TargetedOptionsTestRootRDO {
  public mapOfDefaultIdRDO = new Array<DefaultIdRDO>();
  public mapOfDefaultId$RDO = new Array<DefaultId$RDO>();
  public mapOfDefault_IdRDO = new Array<Default_IdRDO>();
}

export class DefaultIdRDO {
  private _id: string = '';
  public get id(): string {
    return this._id;
  }
  public set id(value) {
    this._id = value;
  }
}

export class DefaultId$RDO {
  private _id$: string = '';
  public get id$(): string {
    return this._id$;
  }
  public set id$(value) {
    this._id$ = value;
  }
}

export class Default_IdRDO {
  private __id: string = '';
  public get _id(): string {
    return this.__id;
  }
  public set _id(value) {
    this.__id = value;
  }
}

// --------------------------------------------------------------
// CONFIG A
// --------------------------------------------------------------
const configA = {
  targetedNodeOptions: [
    {
      sourceNodeMatcher: { nodePath: 'mapOfDefaultIdRDO' },
      makeRdo: (sourceNode: DefaultIdSourceObject) => new DefaultIdRDO(),
    },
    {
      sourceNodeMatcher: { nodePath: 'mapOfDefaultId$RDO' },
      makeRdo: (sourceNode: DefaultIdSourceObject) => new DefaultId$RDO(),
    },
    { sourceNodeMatcher: { nodePath: 'mapOfDefault_IdRDO' }, ignore: true },
  ],
  globalNodeOptions: { commonRdoFieldnamePostfix: '$' },
};

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------

test('commonRdoFieldnamePostfix works with DefaultSourceNodeKeyMakers, AND test that ignore option works', () => {
  const targetedNodeOptionsTestRootRDO = new TargetedOptionsTestRootRDO();
  const graphSynchronizer = new GraphSynchronizer(configA);

  // POSTURE VERIFICATION
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultIdRDO.length).toBeFalsy();
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultIdRDO.length).toBeFalsy();

  // LOAD DATA
  graphSynchronizer.smartSync({ rootRdo: targetedNodeOptionsTestRootRDO, rootSourceNode: targetedNodeOptionsTestRootJSON });

  // RESULTS VERIFICATION STAGE 1
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultIdRDO.length).toEqual(targetedNodeOptionsTestRootJSON.mapOfDefaultIdRDO.length);
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultIdRDO.values().next().value.id).toEqual(targetedNodeOptionsTestRootJSON.mapOfDefaultIdRDO[0].id);

  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultId$RDO.length).toEqual(targetedNodeOptionsTestRootJSON.mapOfDefaultId$RDO.length);
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultId$RDO.values().next().value.id$).toEqual(targetedNodeOptionsTestRootJSON.mapOfDefaultId$RDO[0].id);

  // REMOVE ITEM & SYNC
  const targetedNodeOptionsTestRootJSONWithEdits = _.cloneDeep(targetedNodeOptionsTestRootJSON);
  targetedNodeOptionsTestRootJSONWithEdits.mapOfDefaultIdRDO.pop();
  targetedNodeOptionsTestRootJSONWithEdits.mapOfDefaultId$RDO.pop();
  graphSynchronizer.smartSync({ rootRdo: targetedNodeOptionsTestRootRDO, rootSourceNode: targetedNodeOptionsTestRootJSONWithEdits });

  // RESULTS VERIFICATION STAGE 2
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultIdRDO.length).toEqual(1);
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultIdRDO.values().next().value.id).toEqual(targetedNodeOptionsTestRootJSONWithEdits.mapOfDefaultIdRDO[0].id);

  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultId$RDO.length).toEqual(1);
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultId$RDO.values().next().value.id$).toEqual(targetedNodeOptionsTestRootJSONWithEdits.mapOfDefaultId$RDO[0].id);

  // REMOVE ANOTHER ITEM & SYNC
  targetedNodeOptionsTestRootJSONWithEdits.mapOfDefaultIdRDO.pop();
  targetedNodeOptionsTestRootJSONWithEdits.mapOfDefaultId$RDO.pop();
  graphSynchronizer.smartSync({ rootRdo: targetedNodeOptionsTestRootRDO, rootSourceNode: targetedNodeOptionsTestRootJSONWithEdits });

  // RESULTS VERIFICATION STAGE 3
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultIdRDO.length).toEqual(0);
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultId$RDO.length).toEqual(0);

  // ADD ITEM & SYNC
  targetedNodeOptionsTestRootJSONWithEdits.mapOfDefaultIdRDO.push({ id: '4A' });
  targetedNodeOptionsTestRootJSONWithEdits.mapOfDefaultId$RDO.push({ id: '4B' });
  graphSynchronizer.smartSync({ rootRdo: targetedNodeOptionsTestRootRDO, rootSourceNode: targetedNodeOptionsTestRootJSONWithEdits });

  // RESULTS VERIFICATION STAGE 2
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultIdRDO.length).toEqual(1);
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultIdRDO.values().next().value.id).toEqual(targetedNodeOptionsTestRootJSONWithEdits.mapOfDefaultIdRDO[0].id);

  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultId$RDO.length).toEqual(1);
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultId$RDO.values().next().value.id$).toEqual(targetedNodeOptionsTestRootJSONWithEdits.mapOfDefaultId$RDO[0].id);
});

// --------------------------------------------------------------
// CONFIG B
// --------------------------------------------------------------
const configB = {
  targetedNodeOptions: [
    { sourceNodeMatcher: { nodePath: 'mapOfDefaultIdRDO' }, ignore: true },
    { sourceNodeMatcher: { nodePath: 'mapOfDefaultId$RDO' }, ignore: true },
    {
      sourceNodeMatcher: { nodePath: 'mapOfDefault_IdRDO' },
      makeRdo: (sourceNode: DefaultIdSourceObject) => new DefaultId$RDO(),
      makeRdoCollectionKey: { fromSourceElement: (sourceNode) => sourceNode.id, fromRdoElement: (RDO) => RDO._id },
    },
  ],
  globalNodeOptions: { commonRdoFieldnamePostfix: '$' },
};

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------

test('commonRdoFieldnamePostfix works with DefaultSourceNodeKeyMakers', () => {
  const targetedNodeOptionsTestRootRDO = new TargetedOptionsTestRootRDO();
  const graphSynchronizer = new GraphSynchronizer(configB);

  // POSTURE VERIFICATION
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultIdRDO.length).toBeFalsy();
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultIdRDO.length).toBeFalsy();

  // EXECUTE
  graphSynchronizer.smartSync({ rootRdo: targetedNodeOptionsTestRootRDO, rootSourceNode: targetedNodeOptionsTestRootJSON });

  // RESULTS VERIFICATION
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultIdRDO.length).toEqual(0);
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultId$RDO.length).toEqual(0);

  expect(targetedNodeOptionsTestRootRDO.mapOfDefault_IdRDO.length).toEqual(targetedNodeOptionsTestRootJSON.mapOfDefault_IdRDO.length);
  expect(targetedNodeOptionsTestRootRDO.mapOfDefault_IdRDO.values().next().value.id$).toEqual(targetedNodeOptionsTestRootJSON.mapOfDefault_IdRDO[0].id);
});
