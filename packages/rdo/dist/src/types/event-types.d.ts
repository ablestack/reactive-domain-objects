export declare type nodeChangeType = 'create' | 'update' | 'delete';
export interface NodeChange {
    changeType: nodeChangeType;
    sourceNodePath: string;
    sourceKey: string;
    rdoKey: string;
    oldSourceValue: any | undefined;
    newSourceValue: any | undefined;
}
