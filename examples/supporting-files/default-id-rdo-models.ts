// -----------------------------------
// DEFAULT-ID RDO MODELS
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
