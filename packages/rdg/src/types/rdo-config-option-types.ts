/* eslint-disable @typescript-eslint/interface-name-prefix */

import { IEqualityComparer, IRdoCollectionKeyFactory, IMakeRDO, IRdoCollectionKeyFactoryStrict } from '.';

//---------------------------------------------
//  GRAPH SYNCHRONIZER CONFIG OPTION TYPES
//---------------------------------------------

export interface IGraphSynchronizer {
  smartSync<S extends Record<string, any>, D extends Record<string, any>>({ rootSourceNode, rootDomainNode }: { rootSourceNode: S; rootDomainNode: D });
}

export interface IGraphSyncOptions {
  customEqualityComparer?: IEqualityComparer; //customEqualityComparer is apolloComparer
  globalNodeOptions?: IGlobalPropertyNameTransformation;
  targetedNodeOptions?: Array<INodeSyncOptionsStrict<any, any>>;
}

export interface IGlobalPropertyNameTransformation {
  commonRdoFieldnamePostfix?: string;
  tryGetRdoFieldname?: ({ sourceNodePath, sourceFieldname, sourceFieldVal }: { sourceNodePath: string; sourceFieldname: string; sourceFieldVal: any }) => string;
}

export interface INodeSyncOptions<S, D> {
  sourceNodeMatcher: INodeSelector<S>;
  ignore?: boolean;
  makeRDOCollectionKey?: IRdoCollectionKeyFactory<S, D>; // Match IRDOFactory
  makeRDO?: IMakeRDO<S, D>; // Match IRDOFactory except optional
}

export interface INodeSyncOptionsStrict<S, D> {
  sourceNodeMatcher: INodeSelector<S>;
  ignore?: boolean;
  makeRDOCollectionKey?: IRdoCollectionKeyFactoryStrict<S, D>; // Match IRDOFactorsStrict
  makeRDO?: IMakeRDO<S, D>; // Match IRDOFactory except optional
}

export interface INodeSelector<S> {
  nodePath?: string;
  nodeContent?: (sourceNode: S) => boolean;
}

/***************************************************************************
 * NOTES:
 *
 * Node Sync Options
 *
 * We have *Strict interfaces is because we want to support one internal
 * use case where a `fromDomainElement` factory does not need to be supplied, but in all user-config supplied
 * use cases, require both `fromSourceElement` and `fromDomainElement` for a DomainNodeKeyFactory config
 *
 *****************************************************************************/
