/* eslint-disable @typescript-eslint/interface-name-prefix */
export type nodeChangeType = 'create' | 'update' | 'delete';

export interface NodeChange {
  changeType: nodeChangeType;
  sourceNodePath: string;
  sourceKey: string;
  rdoKey: string;
  rdoOldValue: any | undefined;
  rdoNewValue: any | undefined;
}
