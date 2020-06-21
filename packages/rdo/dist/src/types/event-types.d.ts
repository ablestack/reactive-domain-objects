export declare type nodeChangeType = 'create' | 'update' | 'delete';
export interface NodeChange {
    changeType: nodeChangeType;
    sourceNodePath: string;
    sourceKey: any;
    rdoKey: any;
    oldSourceValue: any | undefined;
    newSourceValue: any | undefined;
}
