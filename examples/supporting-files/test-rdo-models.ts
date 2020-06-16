import { Author } from '.';
import { SyncableCollection } from '@ablestack/rdo-apollo-mobx-connector';
import { SimpleObject } from './test-source-types';

// -----------------------------------
// LIBRARY GRAPH - FOO BAR WITH NOTES
// -----------------------------------

// -----------------------------------
// LIBRARY GRAPH - TEST RDOS
// -----------------------------------

// ------------------------------------------------
// ALL COLLECTION TYPES GRAPH - TEST RDOS
// ------------------------------------------------
export class AllCollectionTypesWithObjectsRDO {
  public arrayOfObjects = new Array<SimpleRDO>();
  public mapOfObjects = new Map<string, SimpleRDO>();
  public setOfObjects = new Set<SimpleRDO>();
  public customCollectionOfObjects = new SyncableCollection({
    makeCollectionKeyFromSourceElement: (o: SimpleObject) => o.id,
    makeCollectionKeyFromRdoElement: (o: SimpleRDO) => o.id,
    makeRdo: (o: SimpleRDO) => new SimpleRDO(),
  });
}

export class AllCollectionTypesWithPrimitivesRDO {
  public arrayOfNumbers = new Array<Number>();
  public mapOfNumbers = new Map<string, number>();
  public setOfNumbers = new Set<number>();
}

export class AllCollectionTypesRDO {
  public arrayOfObjects = new Array<SimpleRDO>();
  public mapOfObjects = new Map<string, SimpleRDO>();
  public setOfObjects = new Set<SimpleRDO>();
  public customCollectionOfObjects = new SyncableCollection({
    makeCollectionKeyFromSourceElement: (o: SimpleObject) => o.id,
    makeCollectionKeyFromRdoElement: (o: SimpleRDO) => o.id,
    makeRdo: (o: SimpleRDO) => new SimpleRDO(),
  });
  public arrayOfNumbers = new Array<Number>();
  public mapOfNumbers = new Map<string, number>();
  public setOfNumbers = new Set<number>();
}

export class SimpleRDO {
  public id = '';
}

// -----------------------------------
// LIBRARY GRAPH - PROP NAME TEST MODEL
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
