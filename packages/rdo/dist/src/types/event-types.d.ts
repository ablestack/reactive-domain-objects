import { NodePatchOperationType } from '.';
export interface NodeChange {
    changeType: NodePatchOperationType;
    sourceNodePath: string;
    sourceKey: any;
    rdoKey: any;
    previousSourceValue: any | undefined;
    newSourceValue: any | undefined;
}
