import { InternalNodeKind } from '..';
export declare class NodeTracker {
    static readonly nodePathSeperator = "/";
    private _sourceNodeInstancePathStack;
    private _sourceNodeTypePathStack;
    pushSourceNodeInstancePathOntoStack<K extends string | number>(key: K, sourceNodeKind: InternalNodeKind): void;
    popSourceNodeInstancePathFromStack(sourceNodeKind: InternalNodeKind): void;
    private _sourceNodeInstancePath;
    getSourceNodeInstancePath(): string;
    private _sourceNodeTypePath;
    getSourceNodePath(): string;
}
