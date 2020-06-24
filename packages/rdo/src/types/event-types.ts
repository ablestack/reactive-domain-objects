/* eslint-disable @typescript-eslint/interface-name-prefix */

import { NodePatchOperationType } from '.';

export interface NodeChange {
  changeType: NodePatchOperationType;
  sourceNodeTypePath: string;
  sourceKey: any;
  rdoKey: any;
  previousSourceValue: any | undefined;
  newSourceValue: any | undefined;
}
