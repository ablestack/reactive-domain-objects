import { IRdoInternalNodeWrapper } from '..';
import { IMakeCollectionKey, ISourceNodeWrapper, RdoNodeTypeInfo, IsIHasCustomRdoFieldNames } from '../types';

export class RdoObjectINW implements IRdoInternalNodeWrapper<any> {
  private _object: object;
  private _makeKey?: IMakeCollectionKey<any>;
  private _wrappedSourceNode: ISourceNodeWrapper;

  constructor({ node, wrappedSourceNode, makeKey }: { node: Record<string, any>; wrappedSourceNode: ISourceNodeWrapper; makeKey: IMakeCollectionKey<any> }) {
    this._object = node;
    this._makeKey = makeKey;
    this._wrappedSourceNode = wrappedSourceNode;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get node() {
    return this._object;
  }

  public get typeInfo(): RdoNodeTypeInfo {
    return { kind: 'Object', type: 'Object', builtInType: '[object Object]' };
  }

  public keys() {
    return Object.keys(this._object);
  }

  public getItem(key: string) {
    return this._object[key];
  }

  public updateItem(value: any) {
    if (this._makeKey) {
      const key = this._makeKey(value);
      if (key in this._object) {
        this._object[key] = value;
        return true;
      } else return false;
    } else {
      throw new Error('make key from RDO element must be available for Object update operations');
    }
  }

  /**
   *
   */
  public getRdoFieldname(): string | undefined {
    // Set Destination Prop Key, and if not found, fall back to name with prefix if supplied
    let rdoFieldname: string | undefined;

    //
    // Try IHasCustomRdoFieldNames
    //
    if (!rdoFieldname && IsIHasCustomRdoFieldNames(this._object)) {
      rdoFieldname = this._object.tryGetRdoFieldname({ sourceNodePath: this._wrappedSourceNode.sourceNodePath, sourceFieldname, sourceFieldVal });
      // If fieldName not in parent, set to null
      if (rdoFieldname && !(rdoFieldname in parentObject)) {
        rdoFieldname = undefined;
      } else {
        logger.trace(`rdoFieldname '${rdoFieldname}' found with IHasCustomRdoFieldNames`);
      }
    }

    //
    // Try _globalNodeOptions
    //
    if (!rdoFieldname && this._globalNodeOptions?.tryGetRdoFieldname) {
      rdoFieldname = this._globalNodeOptions?.tryGetRdoFieldname({ sourceNodePath, sourceFieldname, sourceFieldVal });
      // If fieldName not in parent, set to null
      if (rdoFieldname && !(rdoFieldname in parentObject)) {
        rdoFieldname = undefined;
      } else {
        logger.trace(`rdoFieldname '${rdoFieldname}' found with _globalNodeOptions.tryGetRdoFieldname`);
      }
    }

    //
    // Try stright match for sourceFieldname
    if (!rdoFieldname) {
      rdoFieldname = sourceFieldname;
      if (rdoFieldname && !(rdoFieldname in parentObject)) {
        rdoFieldname = undefined;
      } else {
        logger.trace(`rdoFieldname '${rdoFieldname}' found - straight match for sourceFieldname`);
      }
    }

    //
    // Try commonRdoFieldnamePostfix
    //
    if (!rdoFieldname && this._globalNodeOptions?.commonRdoFieldnamePostfix) {
      const domainPropKeyWithPostfix = `${sourceFieldname}${this._globalNodeOptions.commonRdoFieldnamePostfix}`;
      rdoFieldname = domainPropKeyWithPostfix;

      // If fieldName not in parent, set to null
      if (rdoFieldname && !(rdoFieldname in parentObject)) {
        rdoFieldname = undefined;
      } else {
        logger.trace(`rdoFieldname '${rdoFieldname}' found with commonRdoFieldnamePostfix`);
      }
    }

    return rdoFieldname;
  }
}
