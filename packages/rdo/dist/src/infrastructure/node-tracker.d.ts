import { InternalNodeKind } from '..';
export declare class NodeTracker {
    private _nodePathSeperator;
    private _sourceNodeInstancePathStack;
    private _sourceNodePathStack;
    pushSourceNodeInstancePathOntoStack<K extends string | number>(key: K, sourceNodeKind: InternalNodeKind): void;
    popSourceNodeInstancePathFromStack(sourceNodeKind: InternalNodeKind): void;
    private _sourceNodeInstancePath;
    getSourceNodeInstancePath(): string;
    private _sourceNodePath;
    getSourceNodePath(): string;
}
