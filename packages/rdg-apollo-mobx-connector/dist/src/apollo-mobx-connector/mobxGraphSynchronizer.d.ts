import { GraphSynchronizer, IGraphSyncOptions } from '@ablestack/rdg';
export declare class MobxGraphSynchronizer extends GraphSynchronizer {
    constructor(options?: IGraphSyncOptions);
    smartSync<S extends Record<string, any>, D extends Record<string, any>>({ rootSourceNode, rootDomainNode }: {
        rootSourceNode: S;
        rootDomainNode: D;
    }): void;
}
