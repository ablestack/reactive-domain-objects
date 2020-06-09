import { IGraphSynchronizer, IGraphSyncOptions } from '.';
/**
 * INTERNAL TYPES
 *
 */
export declare type JavaScriptBuiltInType = '[object Array]' | '[object Boolean]' | '[object Date]' | '[object Error]' | '[object Map]' | '[object Number]' | '[object Object]' | '[object RegExp]' | '[object Set]' | '[object String]' | '[object Undefined]';
export declare type JsonNodeKind = 'objectProperty' | 'arrayElement';
export declare type SourceNodeType = 'Primitive' | 'Array' | 'Object';
export declare type SourceNodeTypeInfo = {
    type: SourceNodeType | undefined;
    builtInType: JavaScriptBuiltInType;
};
export declare type RdoFieldType = 'Primitive' | 'Array' | 'Map' | 'Set' | 'ISyncableCollection' | 'Object';
export declare type RdoFieldTypeInfo = {
    type: RdoFieldType | undefined;
    builtInType: JavaScriptBuiltInType;
};
/**
 *
 *
 * @export
 * @class GraphSynchronizer
 */
export declare class GraphSynchronizer implements IGraphSynchronizer {
    private _defaultEqualityComparer;
    private _globalNodeOptions;
    private _targetedOptionNodePathsMap;
    private _targetedOptionMatchersArray;
    private _sourceObjectMap;
    private _sourceNodeInstancePathStack;
    private _sourceNodePathStack;
    private pushSourceNodeInstancePathOntoStack;
    private popSourceNodeInstancePathFromStack;
    private _sourceNodeInstancePath;
    private getSourceNodeInstancePath;
    private _sourceNodePath;
    private getSourceNodePath;
    private setLastSourceNodeInstancePathValue;
    private getLastSourceNodeInstancePathValue;
    constructor(options?: IGraphSyncOptions);
    /**
     *
     */
    private trySynchronizeObject;
    /**
     *
     */
    private getRdoFieldname;
    /**
     *
     */
    private getSourceNodeType;
    /**
     *
     */
    private getRdoFieldType;
    /**
     *
     */
    private trySynchronizeNode;
    /** */
    private trySynchronizeNode_TypeSpecificProcessing;
    /**
     *
     */
    private synchronizeTargetCollectionWithSourceArray;
    /** */
    private tryGetRdoCollectionProcessingMethods;
    /** */
    private getMatchingOptionsForNode;
    /** */
    private getMatchingOptionsForCollectionNode;
    /** */
    private tryMakeAutoKeyMaker;
    /** */
    private getCollectionElementType;
    /**
     *
     */
    private trySynchronizeObjectState;
    /**
     *
     */
    private synchronizeISyncableCollection;
    /**
     *
     */
    private synchronizeTargetMap;
    /**
     *
     */
    private synchronizeTargetSet;
    /**
     *
     */
    private synchronizeTargetArray;
    /**
     *
     */
    smartSync<S extends Record<string, any>, D extends Record<string, any>>({ rootSourceNode, rootRdo }: {
        rootSourceNode: S;
        rootRdo: D;
    }): void;
    /**
     *
     *
     * @memberof GraphSynchronizer
     * @description clears the previously tracked data
     */
    clearTrackedData(): void;
}
