"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphSynchronizer = void 0;
const _1 = require(".");
const logger_1 = require("./infrastructure/logger");
const types_1 = require("./types");
const logger = logger_1.Logger.make('GraphSynchronizer');
const NON_MAP_COLLECTION_SIZE_WARNING_THREASHOLD = 100;
/**
 *
 *
 * @export
 * @class GraphSynchronizer
 */
class GraphSynchronizer {
    // ------------------------------------------------------------------------------------------------------------------
    // CONSTRUCTOR
    // ------------------------------------------------------------------------------------------------------------------
    constructor(options) {
        this._sourceObjectMap = new Map();
        this._sourceNodeInstancePathStack = new Array();
        this._sourceNodePathStack = new Array();
        this._defaultEqualityComparer = (options === null || options === void 0 ? void 0 : options.customEqualityComparer) || _1.comparers.apollo;
        this._globalNodeOptions = options === null || options === void 0 ? void 0 : options.globalNodeOptions;
        this._targetedOptionNodePathsMap = new Map();
        this._targetedOptionMatchersArray = new Array();
        if (options === null || options === void 0 ? void 0 : options.targetedNodeOptions) {
            options === null || options === void 0 ? void 0 : options.targetedNodeOptions.forEach((targetedNodeOptionsItem) => {
                if (targetedNodeOptionsItem.sourceNodeMatcher.nodePath)
                    this._targetedOptionNodePathsMap.set(targetedNodeOptionsItem.sourceNodeMatcher.nodePath, targetedNodeOptionsItem);
                this._targetedOptionMatchersArray.push(targetedNodeOptionsItem);
            });
        }
    }
    // ------------------------------------------------------------------------------------------------------------------
    // PRIVATE PROPERTIES
    // ------------------------------------------------------------------------------------------------------------------
    pushSourceNodeInstancePathOntoStack(key, sourceNodeKind) {
        logger.trace(`Adding SourceNode to sourceNodeInstancePathStack: ${this.getSourceNodeInstancePath()} + ${key} (${sourceNodeKind})`);
        this._sourceNodeInstancePathStack.push(key);
        // reset locally cached dependencies
        this._sourceNodeInstancePath = undefined;
        // push to typepath if objectProperty
        if (sourceNodeKind === 'objectProperty') {
            this._sourceNodePathStack.push(key);
            // reset locally cached dependencies
            this._sourceNodePath = undefined;
        }
    }
    popSourceNodeInstancePathFromStack(sourceNodeKind) {
        const key = this._sourceNodeInstancePathStack.pop();
        logger.trace(`Popping ${key} off sourceNodeInstancePathStack: ${this.getSourceNodeInstancePath()} (${sourceNodeKind})`);
        // reset locally cached dependencies
        this._sourceNodeInstancePath = undefined;
        // pop from typepath if objectProperty
        if (sourceNodeKind === 'objectProperty') {
            this._sourceNodePathStack.pop();
            // reset locally cached dependencies
            this._sourceNodePath = undefined;
        }
    }
    getSourceNodeInstancePath() {
        if (!this._sourceNodeInstancePath)
            this._sourceNodeInstancePath = this._sourceNodeInstancePathStack.join('.');
        return this._sourceNodeInstancePath || '';
    }
    getSourceNodePath() {
        if (!this._sourceNodePath)
            this._sourceNodePath = this._sourceNodePathStack.join('.');
        return this._sourceNodePath || '';
    }
    setLastSourceNodeInstancePathValue(value) {
        this._sourceObjectMap.set(this.getSourceNodeInstancePath(), value);
    }
    getLastSourceNodeInstancePathValue() {
        return this._sourceObjectMap.get(this.getSourceNodeInstancePath());
    }
    // ------------------------------------------------------------------------------------------------------------------
    // PRIVATE METHODS
    // ------------------------------------------------------------------------------------------------------------------
    /**
     *
     */
    trySynchronizeObject({ sourceNodePath, sourceObject, domainObject }) {
        var _a, _b, _c;
        let changed = false;
        // Loop properties
        for (const sourcePropKey of Object.keys(sourceObject)) {
            const sourcePropVal = sourceObject[sourcePropKey];
            // Set Destination Prop Key, and if not found, fall back to name with prefix if supplied
            let domainPropKey = ((_a = this._globalNodeOptions) === null || _a === void 0 ? void 0 : _a.computeDomainFieldname) ? (_b = this._globalNodeOptions) === null || _b === void 0 ? void 0 : _b.computeDomainFieldname({ sourceNodePath, sourcePropKey, sourcePropVal }) : sourcePropKey;
            if (!(domainPropKey in domainObject) && ((_c = this._globalNodeOptions) === null || _c === void 0 ? void 0 : _c.commonDomainFieldnamePostfix)) {
                const domainPropKeyWithPostfix = `${domainPropKey}${this._globalNodeOptions.commonDomainFieldnamePostfix}`;
                logger.trace(`domainPropKey '${domainPropKey}' not found in domainModel. Trying '${domainPropKeyWithPostfix}' `);
                domainPropKey = domainPropKeyWithPostfix;
            }
            // Check to see if key exists
            if (!(domainPropKey in domainObject)) {
                logger.trace(`domainPropKey '${domainPropKey}' not found in domainModel. Skipping property`);
                continue;
            }
            changed ==
                this.trySynchronizeNode({
                    sourceNodeKind: 'objectProperty',
                    sourceNodeKey: sourcePropKey,
                    sourceNodeVal: sourcePropVal,
                    domainNodeKey: domainPropKey,
                    domainNodeVal: domainObject[domainPropKey],
                    tryUpdateDomainNode: (key, value) => _1.CollectionUtils.Record.tryUpdateItem({ collection: domainObject, key, value }),
                }) || changed;
        }
        return changed;
    }
    /**
     *
     */
    getSourceNodeType(sourceNodeVal) {
        const sourceNodeBuiltInType = toString.call(sourceNodeVal);
        switch (sourceNodeBuiltInType) {
            case '[object Boolean]':
            case '[object Date]':
            case '[object Number]':
            case '[object String]': {
                return { type: 'Primitive', builtInType: sourceNodeBuiltInType };
            }
            case '[object Object]': {
                return { type: 'Object', builtInType: sourceNodeBuiltInType };
            }
            case '[object Array]': {
                return { type: 'Array', builtInType: sourceNodeBuiltInType };
            }
            default: {
                logger.warn(`Unable to find Source type for sourceNodeBuiltInType: ${sourceNodeBuiltInType}`, sourceNodeVal);
                return { type: undefined, builtInType: sourceNodeBuiltInType };
            }
        }
    }
    /**
     *
     */
    getDomainNodeType(domainNodeVal) {
        const domainNodeBuiltInType = toString.call(domainNodeVal);
        if (_1.IsISyncableCollection(domainNodeVal)) {
            return { type: 'ISyncableCollection', builtInType: domainNodeBuiltInType };
        }
        switch (domainNodeBuiltInType) {
            case '[object Boolean]':
            case '[object Date]':
            case '[object Number]':
            case '[object String]': {
                return { type: 'Primitive', builtInType: domainNodeBuiltInType };
            }
            case '[object Object]': {
                return { type: 'Object', builtInType: domainNodeBuiltInType };
            }
            case '[object Array]': {
                return { type: 'Array', builtInType: domainNodeBuiltInType };
            }
            case '[object Map]': {
                return { type: 'Map', builtInType: domainNodeBuiltInType };
            }
            case '[object Set]': {
                return { type: 'Set', builtInType: domainNodeBuiltInType };
            }
            default: {
                logger.warn(`Unable to find Domain type for domainNodeBuiltInType: ${domainNodeBuiltInType}`, domainNodeVal);
                return { type: undefined, builtInType: domainNodeBuiltInType };
            }
        }
    }
    /**
     *
     */
    trySynchronizeNode({ sourceNodeKind, sourceNodeKey, sourceNodeVal, domainNodeKey, domainNodeVal, tryUpdateDomainNode, }) {
        logger.trace(`synchronizeProperty (${domainNodeKey}) - enter`, { sourceNodeVal, domainNodeVal });
        // Setup
        let changed = false;
        // Node traversal tracking - step-in
        this.pushSourceNodeInstancePathOntoStack(sourceNodeKey, sourceNodeKind);
        // Test to see if node should be ignored
        const matchingOptions = this.getMatchingOptionsForNode();
        if (matchingOptions === null || matchingOptions === void 0 ? void 0 : matchingOptions.ignore) {
            logger.trace(`synchronizeProperty (${domainNodeKey}) - ignore node`);
        }
        else {
            // Type specific node processing
            const sourceNodeTypeInfo = this.getSourceNodeType(sourceNodeVal);
            const domainNodeTypeInfo = this.getDomainNodeType(domainNodeVal);
            changed = this.trySynchronizeNode_TypeSpecificProcessing({ sourceNodeTypeInfo, domainNodeTypeInfo, sourceNodeVal, domainNodeVal, domainNodeKey, tryUpdateDomainNode });
        }
        // Node traversal tracking - step-out
        this.setLastSourceNodeInstancePathValue(sourceNodeVal);
        this.popSourceNodeInstancePathFromStack(sourceNodeKind);
        return changed;
    }
    /** */
    trySynchronizeNode_TypeSpecificProcessing({ sourceNodeTypeInfo, domainNodeTypeInfo, sourceNodeVal, domainNodeVal, domainNodeKey, tryUpdateDomainNode, }) {
        let changed = false;
        switch (sourceNodeTypeInfo.type) {
            case 'Primitive': {
                if (sourceNodeTypeInfo.builtInType !== domainNodeTypeInfo.builtInType && !!domainNodeTypeInfo.type) {
                    throw Error(`For primitive types, the source type and the domain type must match. Source type: '${sourceNodeTypeInfo.builtInType}', Domain type: ${domainNodeTypeInfo.builtInType}`);
                }
                if (sourceNodeVal !== domainNodeVal) {
                    logger.trace(`primitive value found in domainPropKey ${domainNodeKey}. Setting from old value to new value`, domainNodeVal, sourceNodeVal);
                    tryUpdateDomainNode(domainNodeKey, sourceNodeVal);
                    changed = true;
                }
                break;
            }
            case 'Object': {
                if (domainNodeTypeInfo.type !== 'Object') {
                    throw Error(`[${this.getSourceNodeInstancePath()}] Object source types can only be synchronized to Object destination types, and must not be null. Source type: '${sourceNodeTypeInfo}', Domain type: ${domainNodeTypeInfo} `);
                }
                changed = this.trySynchronizeObjectState({ key: domainNodeKey, sourceObject: sourceNodeVal, domainObject: domainNodeVal });
                break;
            }
            case 'Array': {
                changed = this.synchronizeSourceArray({ domainNodeTypeInfo: domainNodeTypeInfo, sourceNodeTypeInfo: sourceNodeTypeInfo, domainNodeVal: domainNodeVal, sourceCollection: sourceNodeVal });
                break;
            }
            default: {
                logger.trace(`Skipping item ${this.getSourceNodeInstancePath()}. Unable to reconcile synchronization for types - sourceNodeTypeInfo: ${sourceNodeTypeInfo}), domainNodeTypeInfo: ${domainNodeTypeInfo}`);
                break;
            }
        }
        return changed;
    }
    /**
     *
     */
    synchronizeSourceArray({ domainNodeTypeInfo, sourceNodeTypeInfo, domainNodeVal, sourceCollection, }) {
        if (!domainNodeTypeInfo.type)
            throw Error(`Destination types must not be null when transforming Array source type. Source type: '${sourceNodeTypeInfo}', Domain type: ${domainNodeTypeInfo} `);
        const { makeCollectionKey, makeDomainModel } = this.tryGetDomainCollectionProcessingMethods({ sourceCollection, domainCollection: domainNodeVal });
        // VALIDATE
        if (sourceCollection.length > 0 && !(makeCollectionKey === null || makeCollectionKey === void 0 ? void 0 : makeCollectionKey.fromSourceNode)) {
            throw new Error(`Could not find 'makeCollectionKey?.fromSourceNode)' (Path: '${this.getSourceNodePath()}', type: ${domainNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IDomainModelFactory on the contained type`);
        }
        if (sourceCollection.length > 0 && !makeDomainModel) {
            throw new Error(`Could not find 'makeDomainModel' (Path: '${this.getSourceNodePath()}', type: ${domainNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IDomainModelFactory on the contained type`);
        }
        //
        // Execute the sync based on collection type
        //
        //-----------------------------------------------------
        // ISYNCABLECOLLECTION SYNC
        //-----------------------------------------------------
        if (domainNodeTypeInfo.type === 'ISyncableCollection') {
            const domainNodeCollection = domainNodeVal;
            if (sourceCollection.length === 0 && domainNodeCollection.size > 0) {
                domainNodeCollection.clear();
            }
            return this.synchronizeISyncableCollection({ sourceCollection, domainNodeCollection, makeCollectionKey: makeCollectionKey, makeDomainModel: makeDomainModel });
            //-----------------------------------------------------
            // MAP SYNC
            //-----------------------------------------------------
        }
        else if (domainNodeTypeInfo.type === 'Map') {
            const domainNodeCollection = domainNodeVal;
            if (sourceCollection.length === 0 && domainNodeCollection.size > 0) {
                domainNodeCollection.clear();
            }
            return this.synchronizeDomainMap({ sourceCollection, domainNodeCollection, makeCollectionKey: makeCollectionKey, makeDomainModel: makeDomainModel });
            //-----------------------------------------------------
            // SET SYNC
            //-----------------------------------------------------
        }
        else if (domainNodeTypeInfo.type === 'Set') {
            const domainNodeCollection = domainNodeVal;
            if (sourceCollection.length === 0 && domainNodeCollection.size > 0) {
                domainNodeCollection.clear();
            }
            if (domainNodeCollection.size > 0 && !(makeCollectionKey === null || makeCollectionKey === void 0 ? void 0 : makeCollectionKey.fromDomainNode))
                throw new Error(`Could not find '!makeCollectionKey?.fromDomainNode' (Path: '${this.getSourceNodePath()}', type: ${domainNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IDomainModelFactory on the contained type`);
            if (sourceCollection.length > NON_MAP_COLLECTION_SIZE_WARNING_THREASHOLD)
                logger.warn(`Path: '${this.getSourceNodePath()}', collectionSize:${sourceCollection.lastIndexOf}, Domain collection type: Set - It is recommended that the Map or Custom collections types are used in the Domain objects for large collections. Set and Array collections will perform poorly with large collections`);
            return this.synchronizeDomainSet({
                sourceCollection,
                domainNodeCollection,
                makeCollectionKey: makeCollectionKey,
                makeDomainModel: makeDomainModel,
            });
            //-----------------------------------------------------
            // ARRAY SYNC
            //-----------------------------------------------------
        }
        else if (domainNodeTypeInfo.type === 'Array') {
            const domainNodeCollection = domainNodeVal;
            if (sourceCollection.length === 0 && domainNodeCollection.length > 0) {
                _1.CollectionUtils.Array.clear({ collection: domainNodeCollection });
            }
            if (domainNodeCollection.length > 0 && !(makeCollectionKey === null || makeCollectionKey === void 0 ? void 0 : makeCollectionKey.fromDomainNode))
                throw new Error(`Could not find 'makeDomainNodeKeyFromDomainNode' (Path: '${this.getSourceNodePath()}', type: ${domainNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IDomainModelFactory on the contained type`);
            if (sourceCollection.length > 100)
                logger.warn(`Path: '${this.getSourceNodePath()}', collectionSize:${sourceCollection.lastIndexOf}, Domain collection type: Array - It is recommended that the Map or Custom collections types are used in the Domain objects for large collections. Set and Array collections will perform poorly with large collections`);
            return this.synchronizeDomainArray({
                sourceCollection,
                domainNodeCollection,
                makeCollectionKey: makeCollectionKey,
                makeDomainModel: makeDomainModel,
            });
        }
        return false;
    }
    /** */
    tryGetDomainCollectionProcessingMethods({ sourceCollection, domainCollection }) {
        var _a, _b, _c;
        let makeCollectionKey;
        let makeDomainModel;
        const collectionElementType = this.getCollectionElementType({ sourceCollection, domainCollection });
        //
        // If types are primitive, provide auto methods, else try and get from configuration
        //
        if (collectionElementType === 'primitive' || collectionElementType === 'empty') {
            makeCollectionKey = { fromSourceNode: (primitive) => primitive.toString(), fromDomainNode: (primitive) => primitive.toString() };
            makeDomainModel = (primitive) => primitive;
        }
        else {
            const targetDerivedOptions = this.getMatchingOptionsForCollectionNode({ sourceCollection, domainCollection });
            const typeDerivedOptions = _1.IsIDomainModelFactory(domainCollection)
                ? { makeCollectionKey: domainCollection.makeCollectionKey, makeDomainModel: domainCollection.makeDomainModel }
                : { makeDomainNodeKeyFromSourceNode: undefined, makeDomainNodeKeyFromDomainNode: domainCollection.makeDomainNodeKeyFromDomainNode, makeDomainModel: undefined };
            // GET CONFIG ITEM: makeDomainNodeKeyFromSourceNode
            makeCollectionKey = ((_a = targetDerivedOptions === null || targetDerivedOptions === void 0 ? void 0 : targetDerivedOptions.domainCollection) === null || _a === void 0 ? void 0 : _a.makeCollectionKey) || typeDerivedOptions.makeCollectionKey || this.tryMakeAutoKeyMaker({ sourceCollection, domainCollection });
            // GET CONFIG ITEM: makeDomainModel
            makeDomainModel = ((_b = targetDerivedOptions === null || targetDerivedOptions === void 0 ? void 0 : targetDerivedOptions.domainCollection) === null || _b === void 0 ? void 0 : _b.makeDomainModel) || ((_c = targetDerivedOptions === null || targetDerivedOptions === void 0 ? void 0 : targetDerivedOptions.domainCollection) === null || _c === void 0 ? void 0 : _c.makeDomainModel) || typeDerivedOptions.makeDomainModel;
        }
        return { makeCollectionKey, makeDomainModel };
    }
    /** */
    getMatchingOptionsForNode() {
        const currentPath = this.getSourceNodePath();
        return this._targetedOptionNodePathsMap.get(currentPath);
    }
    /** */
    getMatchingOptionsForCollectionNode({ sourceCollection, domainCollection }) {
        let options = this.getMatchingOptionsForNode();
        if (options) {
            return options;
        }
        if (this._targetedOptionMatchersArray.length === 0)
            return;
        // Selector targeted options could be matching elements of a collection
        // So look at the first element of source or domain collections to check
        // Try and get options from Source collection
        if (sourceCollection && sourceCollection.length > 0) {
            const firstItemInSourceCollection = sourceCollection[0];
            options = this._targetedOptionMatchersArray.find((targetOptionsItem) => (targetOptionsItem.sourceNodeMatcher.nodeContent ? targetOptionsItem.sourceNodeMatcher.nodeContent(firstItemInSourceCollection) : false));
            if (options)
                return options;
        }
        // Try and get options from Domain collection
        // ASSUMPTION - all supported collection types implement Iterable<>
        const firstItemInDomainCollection = domainCollection[Symbol.iterator]().next().value;
        options = this._targetedOptionMatchersArray.find((targetOptionsItem) => (targetOptionsItem.sourceNodeMatcher.nodeContent ? targetOptionsItem.sourceNodeMatcher.nodeContent(firstItemInDomainCollection) : false));
        return options;
    }
    /** */
    tryMakeAutoKeyMaker({ sourceCollection, domainCollection }) {
        var _a;
        let makeCollectionKey = {};
        // Try and get options from source collection
        if (sourceCollection && sourceCollection.length > 0) {
            const firstItemInSourceCollection = sourceCollection[0];
            if (firstItemInSourceCollection && firstItemInSourceCollection.id) {
                makeCollectionKey.fromSourceNode = (sourceNode) => {
                    return sourceNode.id;
                };
            }
        }
        // Try and get options from domain collection
        const firstItemInDomainCollection = domainCollection[Symbol.iterator]().next().value;
        if (firstItemInDomainCollection) {
            let idKey = 'id';
            let hasIdKey = idKey in firstItemInDomainCollection;
            // If matching id key not found, try with standardPostfix if config setting supplied
            if (!hasIdKey && ((_a = this._globalNodeOptions) === null || _a === void 0 ? void 0 : _a.commonDomainFieldnamePostfix)) {
                idKey = `${idKey}${this._globalNodeOptions.commonDomainFieldnamePostfix}`;
                hasIdKey = idKey in firstItemInDomainCollection;
            }
            if (hasIdKey) {
                makeCollectionKey.fromDomainNode = (domainNode) => {
                    return domainNode[idKey];
                };
            }
        }
        // Allow to return if fromDomainNode is null, even though this is not allowed in user supplied options
        //  When defaultKeyMaker, the code can handle a special case where fromDomainNode is null (when no items in domain collection)
        if (!makeCollectionKey || !makeCollectionKey.fromSourceNode)
            return undefined;
        else
            return makeCollectionKey;
    }
    /** */
    getCollectionElementType({ sourceCollection, domainCollection }) {
        // Try and get collection type from source collection
        if (sourceCollection && sourceCollection.length > 0) {
            const firstItemInSourceCollection = sourceCollection[0];
            const sourceNodeTypeInfo = this.getSourceNodeType(firstItemInSourceCollection);
            if (sourceNodeTypeInfo.type === 'Primitive')
                return 'primitive';
            else
                return 'object';
        }
        // Try and get collection type from Domain collection
        // ASSUMPTION - all supported collection types implement Iterable<>
        const firstItemInDomainCollection = domainCollection[Symbol.iterator]().next().value;
        if (!firstItemInDomainCollection)
            return 'empty';
        const domainNodeTypeInfo = this.getDomainNodeType(firstItemInDomainCollection);
        if (domainNodeTypeInfo.type === 'Primitive')
            return 'primitive';
        else
            return 'object';
    }
    /**
     *
     */
    trySynchronizeObjectState({ key, sourceObject, domainObject, }) {
        let changed = false;
        const sourceNodePath = this.getSourceNodePath();
        const lastSourceObject = this.getLastSourceNodeInstancePathValue();
        // Check if previous source state and new source state are equal
        const isAlreadyInSync = _1.IsICustomEqualityDomainModel(domainObject) ? domainObject.isStateEqual(sourceObject, lastSourceObject) : this._defaultEqualityComparer(sourceObject, lastSourceObject);
        // Call lifecycle methods if found
        if (types_1.IsIBeforeSyncIfNeeded(domainObject))
            domainObject.beforeSyncIfNeeded({ sourceObject, isSyncNeeded: !isAlreadyInSync });
        // Call lifecycle methods if found
        if (types_1.IsIBeforeSyncUpdate(domainObject))
            domainObject.beforeSyncUpdate({ sourceObject });
        //logger.debug(`'${this.getSourceNodeInstancePath()}':isInSync ${isInSync}`, { sourceObject, lastSourceObject });
        if (!isAlreadyInSync) {
            // Call lifecycle methods if found
            if (types_1.IsIBeforeSyncUpdate(domainObject))
                domainObject.beforeSyncUpdate({ sourceObject });
            // Synchronize
            if (_1.IsICustomSync(domainObject)) {
                logger.trace(`synchronizeObjectState - ${sourceNodePath} - custom state synchronizer found. Using to sync`);
                changed = domainObject.synchronizeState({ sourceObject, graphSynchronizer: this });
            }
            else {
                logger.trace(`synchronizeObjectState - ${sourceNodePath} - no custom state synchronizer found. Using autoSync`);
                changed = this.trySynchronizeObject({ sourceNodePath, sourceObject, domainObject });
            }
            // Call lifecycle methods if found
            if (types_1.IsIAfterSyncUpdate(domainObject))
                domainObject.afterSyncUpdate({ sourceObject });
        }
        else {
            logger.trace(`synchronizeObjectState - ${sourceNodePath} - already in sync. Skipping`);
        }
        // Call lifecycle methods if found
        if (types_1.IsIAfterSyncIfNeeded(domainObject))
            domainObject.afterSyncIfNeeded({ sourceObject, syncAttempted: !isAlreadyInSync, domainModelChanged: changed });
        return changed;
    }
    /**
     *
     */
    synchronizeISyncableCollection({ sourceCollection, domainNodeCollection, makeCollectionKey, makeDomainModel, }) {
        return _1.SyncUtils.synchronizeCollection({
            sourceCollection,
            getTargetCollectionSize: () => domainNodeCollection.size,
            getTargetCollectionKeys: domainNodeCollection.getKeys,
            makeDomainNodeKeyFromSourceNode: makeCollectionKey === null || makeCollectionKey === void 0 ? void 0 : makeCollectionKey.fromSourceNode,
            tryGetItemFromTargetCollection: (key) => domainNodeCollection.tryGetItemFromTargetCollection(key),
            insertItemToTargetCollection: (key, value) => domainNodeCollection.insertItemToTargetCollection(key, value),
            tryDeleteItemFromTargetCollection: (key) => domainNodeCollection.tryDeleteItemFromTargetCollection(key),
            makeItemForTargetCollection: makeDomainModel,
            trySyncElement: ({ sourceElementKey, sourceElementVal, targetElementKey, targetElementVal }) => this.trySynchronizeNode({
                sourceNodeKind: 'arrayElement',
                sourceNodeKey: sourceElementKey,
                sourceNodeVal: sourceElementVal,
                domainNodeKey: targetElementKey,
                domainNodeVal: targetElementVal,
                tryUpdateDomainNode: (key, value) => domainNodeCollection.updateItemInTargetCollection(key, value),
            }),
        });
    }
    /**
     *
     */
    synchronizeDomainMap({ sourceCollection, domainNodeCollection, makeCollectionKey, makeDomainModel, }) {
        return _1.SyncUtils.synchronizeCollection({
            sourceCollection,
            getTargetCollectionSize: () => domainNodeCollection.size,
            getTargetCollectionKeys: () => Array.from(domainNodeCollection.keys()),
            makeDomainNodeKeyFromSourceNode: makeCollectionKey === null || makeCollectionKey === void 0 ? void 0 : makeCollectionKey.fromSourceNode,
            tryGetItemFromTargetCollection: (key) => domainNodeCollection.get(key),
            insertItemToTargetCollection: (key, value) => domainNodeCollection.set(key, value),
            tryDeleteItemFromTargetCollection: (key) => domainNodeCollection.delete(key),
            makeItemForTargetCollection: makeDomainModel,
            trySyncElement: ({ sourceElementKey, sourceElementVal, targetElementKey, targetElementVal }) => this.trySynchronizeNode({
                sourceNodeKind: 'arrayElement',
                sourceNodeKey: sourceElementKey,
                sourceNodeVal: sourceElementVal,
                domainNodeKey: targetElementKey,
                domainNodeVal: targetElementVal,
                tryUpdateDomainNode: (key, value) => domainNodeCollection.set(key, value),
            }),
        });
    }
    /**
     *
     */
    synchronizeDomainSet({ sourceCollection, domainNodeCollection, makeCollectionKey, makeDomainModel, }) {
        return _1.SyncUtils.synchronizeCollection({
            sourceCollection,
            getTargetCollectionSize: () => domainNodeCollection.size,
            getTargetCollectionKeys: (makeCollectionKey === null || makeCollectionKey === void 0 ? void 0 : makeCollectionKey.fromDomainNode) ? () => _1.CollectionUtils.Set.getKeys({ collection: domainNodeCollection, makeKey: makeCollectionKey.fromDomainNode }) : undefined,
            makeDomainNodeKeyFromSourceNode: makeCollectionKey === null || makeCollectionKey === void 0 ? void 0 : makeCollectionKey.fromSourceNode,
            tryGetItemFromTargetCollection: (makeCollectionKey === null || makeCollectionKey === void 0 ? void 0 : makeCollectionKey.fromDomainNode) ? (key) => _1.CollectionUtils.Set.tryGetItem({ collection: domainNodeCollection, makeKey: makeCollectionKey.fromDomainNode, key }) : undefined,
            insertItemToTargetCollection: (key, value) => _1.CollectionUtils.Set.insertItem({ collection: domainNodeCollection, key, value }),
            tryDeleteItemFromTargetCollection: (makeCollectionKey === null || makeCollectionKey === void 0 ? void 0 : makeCollectionKey.fromDomainNode) ? (key) => _1.CollectionUtils.Set.tryDeleteItem({ collection: domainNodeCollection, makeKey: makeCollectionKey.fromDomainNode, key }) : undefined,
            makeItemForTargetCollection: makeDomainModel,
            trySyncElement: ({ sourceElementKey, sourceElementVal, targetElementKey, targetElementVal }) => this.trySynchronizeNode({
                sourceNodeKind: 'arrayElement',
                sourceNodeKey: sourceElementKey,
                sourceNodeVal: sourceElementVal,
                domainNodeKey: targetElementKey,
                domainNodeVal: targetElementVal,
                tryUpdateDomainNode: (key, value) => _1.CollectionUtils.Set.tryUpdateItem({ collection: domainNodeCollection, makeKey: makeCollectionKey.fromDomainNode, value }),
            }),
        });
    }
    /**
     *
     */
    synchronizeDomainArray({ sourceCollection, domainNodeCollection, makeCollectionKey, makeDomainModel, }) {
        return _1.SyncUtils.synchronizeCollection({
            sourceCollection,
            getTargetCollectionSize: () => domainNodeCollection.length,
            getTargetCollectionKeys: (makeCollectionKey === null || makeCollectionKey === void 0 ? void 0 : makeCollectionKey.fromDomainNode) ? () => _1.CollectionUtils.Array.getKeys({ collection: domainNodeCollection, makeKey: makeCollectionKey.fromDomainNode }) : undefined,
            makeDomainNodeKeyFromSourceNode: makeCollectionKey === null || makeCollectionKey === void 0 ? void 0 : makeCollectionKey.fromSourceNode,
            makeItemForTargetCollection: makeDomainModel,
            tryGetItemFromTargetCollection: (makeCollectionKey === null || makeCollectionKey === void 0 ? void 0 : makeCollectionKey.fromDomainNode) ? (key) => _1.CollectionUtils.Array.getItem({ collection: domainNodeCollection, makeKey: makeCollectionKey === null || makeCollectionKey === void 0 ? void 0 : makeCollectionKey.fromDomainNode, key }) : undefined,
            insertItemToTargetCollection: (key, value) => _1.CollectionUtils.Array.insertItem({ collection: domainNodeCollection, key, value }),
            tryDeleteItemFromTargetCollection: (makeCollectionKey === null || makeCollectionKey === void 0 ? void 0 : makeCollectionKey.fromDomainNode) ? (key) => _1.CollectionUtils.Array.deleteItem({ collection: domainNodeCollection, makeKey: makeCollectionKey.fromDomainNode, key }) : undefined,
            trySyncElement: ({ sourceElementKey, sourceElementVal, targetElementKey, targetElementVal }) => this.trySynchronizeNode({
                sourceNodeKind: 'arrayElement',
                sourceNodeKey: sourceElementKey,
                sourceNodeVal: sourceElementVal,
                domainNodeKey: targetElementKey,
                domainNodeVal: targetElementVal,
                tryUpdateDomainNode: (key, value) => _1.CollectionUtils.Array.insertItem({ collection: domainNodeCollection, key, value }),
            }),
        });
    }
    // ------------------------------------------------------------------------------------------------------------------
    // PUBLIC METHODS
    // ------------------------------------------------------------------------------------------------------------------
    /**
     *
     */
    smartSync({ rootSourceNode, rootDomainNode }) {
        if (!rootSourceNode || !rootDomainNode) {
            logger.warn('smartSync - sourceObject or domainModel was null. Exiting', { rootSourceNode, rootSyncableObject: rootDomainNode });
            return;
        }
        logger.trace('smartSync - sync traversal of object tree starting at root', { rootSourceNode, rootSyncableObject: rootDomainNode });
        this.trySynchronizeObject({ sourceNodePath: '', sourceObject: rootSourceNode, domainObject: rootDomainNode });
        logger.trace('smartSync - object tree sync traversal completed', { rootSourceNode, rootSyncableObject: rootDomainNode });
    }
    /**
     *
     *
     * @memberof GraphSynchronizer
     * @description clears the previously tracked data
     */
    clearTrackedData() {
        this._sourceObjectMap.clear();
    }
}
exports.GraphSynchronizer = GraphSynchronizer;
//# sourceMappingURL=graphSynchronizer.js.map