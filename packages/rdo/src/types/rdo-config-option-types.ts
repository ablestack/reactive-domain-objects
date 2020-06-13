/* eslint-disable @typescript-eslint/interface-name-prefix */

import { IEqualityComparer, IRdoCollectionKeyFactory, IMakeRdo, IRdoCollectionKeyFactoryStrict } from '.';

//---------------------------------------------
//  GRAPH SYNCHRONIZER CONFIG OPTION TYPES
//---------------------------------------------

export interface IGraphSynchronizer {
  smartSync<S extends Record<string, any>, D extends Record<string, any>>({ rootSourceNode, rootRdo }: { rootSourceNode: S; rootRdo: D });
}

export interface IGraphSyncOptions {
  customEqualityComparer?: IEqualityComparer; //customEqualityComparer is apolloComparer
  globalNodeOptions?: IGlobalNameOptions;
  targetedNodeOptions?: Array<INodeSyncOptionsStrict<any, any>>;
}

export interface IGlobalNameOptions {
  commonRdoFieldnamePostfix?: string;
  tryGetRdoFieldname?: ({ sourceNodePath, sourceFieldname, sourceFieldVal }: { sourceNodePath: string; sourceFieldname: string; sourceFieldVal: any }) => string;
}

export interface INodeSyncOptions<S, D> {
  sourceNodeMatcher: INodeSelector<S>;
  ignore?: boolean;
  makeRdoCollectionKey?: IRdoCollectionKeyFactory<S, D>; // Match IRdoFactory
  makeRdo?: IMakeRdo<S, D>; // Match IRdoFactory except optional
}

export interface INodeSyncOptionsStrict<S, D> {
  sourceNodeMatcher: INodeSelector<S>;
  ignore?: boolean;
  makeRdoCollectionKey?: IRdoCollectionKeyFactoryStrict<S, D>; // Match IRDOFactorsStrict
  makeRdo?: IMakeRdo<S, D>; // Match IRdoFactory except optional
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
 * use case where a `fromRdoElement` factory does not need to be supplied, but in all user-config supplied
 * use cases, require both `fromSourceElement` and `fromRdoElement` for a DomainNodeKeyFactory config
 *
 *****************************************************************************/
