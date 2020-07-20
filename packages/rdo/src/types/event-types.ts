/* eslint-disable @typescript-eslint/interface-name-prefix */

import { NodePatchOperationType } from '.';

export interface NodeChange {
  changeType: NodePatchOperationType;
  sourceNodeTypePath: string;
  sourceNodeInstancePath: string;
  index?: number;
  sourceKey: any;
  rdoKey: any;
  previousSourceValue: any | undefined;
  newSourceValue: any | undefined;
}
