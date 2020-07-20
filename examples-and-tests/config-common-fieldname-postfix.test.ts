import { GraphSynchronizer } from '@ablestack/rdo';
import { Logger } from '@ablestack/rdo/infrastructure/logger';
import _ from 'lodash';

const logger = Logger.make('flat-object-sync.test.ts');

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
  const rdo = new TargetedOptionsTestRootRDO();
  const graphSynchronizer = new GraphSynchronizer(configA);

  // POSTURE VERIFICATION
  expect(rdo.mapOfDefaultIdRDO.length).toBeFalsy();
  expect(rdo.mapOfDefaultIdRDO.length).toBeFalsy();

  // LOAD DATA
  graphSynchronizer.smartSync({ rootRdo: rdo, rootSourceNode: json });

  // RESULTS VERIFICATION STAGE 1
  expect(rdo.mapOfDefaultIdRDO.length).toEqual(json.mapOfDefaultIdRDO.length);
  expect(rdo.mapOfDefaultIdRDO.values().next().value.id).toEqual(json.mapOfDefaultIdRDO[0].id);

  expect(rdo.mapOfDefaultId$RDO.length).toEqual(json.mapOfDefaultId$RDO.length);
  expect(rdo.mapOfDefaultId$RDO.values().next().value.id$).toEqual(json.mapOfDefaultId$RDO[0].id);

  // REMOVE ITEM & SYNC
  let jsonWithEdits = _.cloneDeep(json);
  jsonWithEdits.mapOfDefaultIdRDO.pop();
  jsonWithEdits.mapOfDefaultId$RDO.pop();
  graphSynchronizer.smartSync({ rootRdo: rdo, rootSourceNode: jsonWithEdits });

  // RESULTS VERIFICATION STAGE 2
  expect(rdo.mapOfDefaultIdRDO.length).toEqual(1);
  expect(rdo.mapOfDefaultIdRDO.values().next().value.id).toEqual(jsonWithEdits.mapOfDefaultIdRDO[0].id);

  expect(rdo.mapOfDefaultId$RDO.length).toEqual(1);
  expect(rdo.mapOfDefaultId$RDO.values().next().value.id$).toEqual(jsonWithEdits.mapOfDefaultId$RDO[0].id);

  // REMOVE ANOTHER ITEM & SYNC
  jsonWithEdits = _.cloneDeep(jsonWithEdits);
  jsonWithEdits.mapOfDefaultIdRDO.pop();
  jsonWithEdits.mapOfDefaultId$RDO.pop();
  graphSynchronizer.smartSync({ rootRdo: rdo, rootSourceNode: jsonWithEdits });

  // RESULTS VERIFICATION STAGE 3
  expect(rdo.mapOfDefaultIdRDO.length).toEqual(0);
  expect(rdo.mapOfDefaultId$RDO.length).toEqual(0);

  // ADD ITEM & SYNC
  jsonWithEdits = _.cloneDeep(jsonWithEdits);
  jsonWithEdits.mapOfDefaultIdRDO.push({ id: '4A' });
  jsonWithEdits.mapOfDefaultId$RDO.push({ id: '4B' });
  graphSynchronizer.smartSync({ rootRdo: rdo, rootSourceNode: jsonWithEdits });

  // RESULTS VERIFICATION STAGE 2
  expect(rdo.mapOfDefaultIdRDO.length).toEqual(1);
  expect(rdo.mapOfDefaultIdRDO.values().next().value.id).toEqual(jsonWithEdits.mapOfDefaultIdRDO[0].id);

  expect(rdo.mapOfDefaultId$RDO.length).toEqual(1);
  expect(rdo.mapOfDefaultId$RDO.values().next().value.id$).toEqual(jsonWithEdits.mapOfDefaultId$RDO[0].id);
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
  graphSynchronizer.smartSync({ rootRdo: targetedNodeOptionsTestRootRDO, rootSourceNode: json });

  // RESULTS VERIFICATION
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultIdRDO.length).toEqual(0);
  expect(targetedNodeOptionsTestRootRDO.mapOfDefaultId$RDO.length).toEqual(0);

  expect(targetedNodeOptionsTestRootRDO.mapOfDefault_IdRDO.length).toEqual(json.mapOfDefault_IdRDO.length);
  expect(targetedNodeOptionsTestRootRDO.mapOfDefault_IdRDO.values().next().value.id$).toEqual(json.mapOfDefault_IdRDO[0].id);
});

// --------------------------------------------------------------
// MODELS & DATA
// --------------------------------------------------------------

//
// Source Data Models
export type DefaultIdSourceObject = { id: string };
export type PropNameTestRoot = { mapOfDefaultIdRDO: DefaultIdSourceObject[]; mapOfDefaultId$RDO: DefaultIdSourceObject[]; mapOfDefault_IdRDO: DefaultIdSourceObject[] };

//
// Source Data
export const json: PropNameTestRoot = {
  mapOfDefaultIdRDO: [{ id: '1A' }, { id: '1B' }],
  mapOfDefaultId$RDO: [{ id: '2A' }, { id: '2B' }],
  mapOfDefault_IdRDO: [{ id: '3A' }, { id: '3B' }],
};

//
// RDO Graphs
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
