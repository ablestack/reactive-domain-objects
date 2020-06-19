/* eslint-disable @typescript-eslint/interface-name-prefix */

import { IEqualityComparer, IMakeRdo, MakeCollectionKeyMethod } from '.';

//---------------------------------------------
//  GRAPH SYNCHRONIZER CONFIG OPTION TYPES
//---------------------------------------------

export interface IGraphSynchronizer {
  smartSync<S extends Record<string, any>, D extends Record<string, any>>({ rootSourceNode, rootRdo }: { rootSourceNode: S; rootRdo: D });
}

export interface IGraphSyncOptions {
  customEqualityComparer?: IEqualityComparer; //customEqualityComparer is apolloComparer
  globalNodeOptions?: IGlobalNodeOptions;
  targetedNodeOptions?: Array<INodeSyncOptions<any, any>>;
}

export type autoMakeRdoAsTypes = 'plain-object-literals' | 'mobx-observable-object-literals';
export interface IGlobalNodeOptions {
  commonRdoFieldnamePostfix?: string;
  tryGetRdoFieldname?: ({ sourceNodePath, sourceFieldname, sourceFieldVal }: { sourceNodePath: string; sourceFieldname: string; sourceFieldVal: any }) => string;
  makeRdo?: IMakeRdo<any, any>['makeRdo'];
  autoMakeRdoTypes?: {
    objectFields: boolean;
    collectionElements: boolean;
    as: autoMakeRdoAsTypes;
  };
}

export interface INodeSyncOptions<S, D> {
  sourceNodeMatcher: INodeSelector<S>;
  ignore?: boolean;
  makeRdoCollectionKey?: {
    fromSourceElement: MakeCollectionKeyMethod<S>;
    fromRdoElement: MakeCollectionKeyMethod<D>;
  };
  makeRdo?: IMakeRdo<S, D>['makeRdo'];
}

export interface INodeSelector<S> {
  nodePath?: string;
  nodeContent?: (sourceNode: S) => boolean;
}
