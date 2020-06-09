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
                logger.trace(`domainPropKey '${domainPropKey}' not found in RDO. Trying '${domainPropKeyWithPostfix}' `);
                domainPropKey = domainPropKeyWithPostfix;
            }
            // Check to see if key exists
            if (!(domainPropKey in domainObject)) {
                logger.trace(`domainPropKey '${domainPropKey}' not found in RDO. Skipping property`);
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
        const { makeRDOCollectionKey, makeRDO } = this.tryGetDomainCollectionProcessingMethods({ sourceCollection, domainCollection: domainNodeVal });
        // VALIDATE
        if (sourceCollection.length > 0 && !(makeRDOCollectionKey === null || makeRDOCollectionKey === void 0 ? void 0 : makeRDOCollectionKey.fromSourceElement)) {
            throw new Error(`Could not find 'makeRDOCollectionKey?.fromSourceElement)' (Path: '${this.getSourceNodePath()}', type: ${domainNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IRDOFactory on the contained type`);
        }
        if (sourceCollection.length > 0 && !makeRDO) {
            throw new Error(`Could not find 'makeRDO' (Path: '${this.getSourceNodePath()}', type: ${domainNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IRDOFactory on the contained type`);
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
            return this.synchronizeISyncableCollection({ sourceCollection, domainNodeCollection, makeRDOCollectionKey: makeRDOCollectionKey, makeRDO: makeRDO });
            //-----------------------------------------------------
            // MAP SYNC
            //-----------------------------------------------------
        }
        else if (domainNodeTypeInfo.type === 'Map') {
            const domainNodeCollection = domainNodeVal;
            if (sourceCollection.length === 0 && domainNodeCollection.size > 0) {
                domainNodeCollection.clear();
            }
            return this.synchronizeDomainMap({ sourceCollection, domainNodeCollection, makeRDOCollectionKey: makeRDOCollectionKey, makeRDO: makeRDO });
            //-----------------------------------------------------
            // SET SYNC
            //-----------------------------------------------------
        }
        else if (domainNodeTypeInfo.type === 'Set') {
            const domainNodeCollection = domainNodeVal;
            if (sourceCollection.length === 0 && domainNodeCollection.size > 0) {
                domainNodeCollection.clear();
            }
            if (domainNodeCollection.size > 0 && !(makeRDOCollectionKey === null || makeRDOCollectionKey === void 0 ? void 0 : makeRDOCollectionKey.fromDomainElement))
                throw new Error(`Could not find '!makeRDOCollectionKey?.fromDomainElement' (Path: '${this.getSourceNodePath()}', type: ${domainNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IRDOFactory on the contained type`);
            if (sourceCollection.length > NON_MAP_COLLECTION_SIZE_WARNING_THREASHOLD)
                logger.warn(`Path: '${this.getSourceNodePath()}', collectionSize:${sourceCollection.lastIndexOf}, Domain collection type: Set - It is recommended that the Map or Custom collections types are used in the Domain objects for large collections. Set and Array collections will perform poorly with large collections`);
            return this.synchronizeDomainSet({
                sourceCollection,
                domainNodeCollection,
                makeRDOCollectionKey: makeRDOCollectionKey,
                makeRDO: makeRDO,
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
            if (domainNodeCollection.length > 0 && !(makeRDOCollectionKey === null || makeRDOCollectionKey === void 0 ? void 0 : makeRDOCollectionKey.fromDomainElement))
                throw new Error(`Could not find 'makeRDOCollectionKeyFromDomainElement' (Path: '${this.getSourceNodePath()}', type: ${domainNodeTypeInfo}). Please define in GraphSynchronizerOptions, or by implementing IRDOFactory on the contained type`);
            if (sourceCollection.length > 100)
                logger.warn(`Path: '${this.getSourceNodePath()}', collectionSize:${sourceCollection.lastIndexOf}, Domain collection type: Array - It is recommended that the Map or Custom collections types are used in the Domain objects for large collections. Set and Array collections will perform poorly with large collections`);
            return this.synchronizeDomainArray({
                sourceCollection,
                domainNodeCollection,
                makeRDOCollectionKey: makeRDOCollectionKey,
                makeRDO: makeRDO,
            });
        }
        return false;
    }
    /** */
    tryGetDomainCollectionProcessingMethods({ sourceCollection, domainCollection }) {
        let makeRDOCollectionKey;
        let makeRDO;
        const collectionElementType = this.getCollectionElementType({ sourceCollection, domainCollection });
        //
        // If types are primitive, provide auto methods, else try and get from configuration
        //
        if (collectionElementType === 'primitive' || collectionElementType === 'empty') {
            makeRDOCollectionKey = { fromSourceElement: (primitive) => primitive.toString(), fromDomainElement: (primitive) => primitive.toString() };
            makeRDO = (primitive) => primitive;
        }
        else {
            const targetDerivedOptions = this.getMatchingOptionsForCollectionNode({ sourceCollection, domainCollection });
            const typeDerivedOptions = types_1.IsISyncableRDOCollection(domainCollection)
                ? { makeRDOCollectionKey: domainCollection.makeRDOCollectionKey, makeRDO: domainCollection.makeRDO }
                : { makeRDOCollectionKeyFromSourceElement: undefined, makeRDOCollectionKeyFromDomainElement: domainCollection.makeRDOCollectionKeyFromDomainElement, makeRDO: undefined };
            // GET CONFIG ITEM: makeRDOCollectionKeyFromSourceElement
            makeRDOCollectionKey = (targetDerivedOptions === null || targetDerivedOptions === void 0 ? void 0 : targetDerivedOptions.makeRDOCollectionKey) || typeDerivedOptions.makeRDOCollectionKey || this.tryMakeAutoKeyMaker({ sourceCollection, domainCollection });
            // GET CONFIG ITEM: makeRDO
            makeRDO = (targetDerivedOptions === null || targetDerivedOptions === void 0 ? void 0 : targetDerivedOptions.makeRDO) || (targetDerivedOptions === null || targetDerivedOptions === void 0 ? void 0 : targetDerivedOptions.makeRDO) || typeDerivedOptions.makeRDO;
        }
        return { makeRDOCollectionKey, makeRDO };
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
        let makeRDOCollectionKey = {};
        // Try and get options from source collection
        if (sourceCollection && sourceCollection.length > 0) {
            const firstItemInSourceCollection = sourceCollection[0];
            if (firstItemInSourceCollection && firstItemInSourceCollection.id) {
                makeRDOCollectionKey.fromSourceElement = (sourceNode) => {
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
                makeRDOCollectionKey.fromDomainElement = (domainNode) => {
                    return domainNode[idKey];
                };
            }
        }
        // Allow to return if fromDomainElement is null, even though this is not allowed in user supplied options
        //  When defaultKeyMaker, the code can handle a special case where fromDomainElement is null (when no items in domain collection)
        if (!makeRDOCollectionKey || !makeRDOCollectionKey.fromSourceElement)
            return undefined;
        else
            return makeRDOCollectionKey;
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
        const isAlreadyInSync = _1.IsICustomEqualityRDO(domainObject) ? domainObject.isStateEqual(sourceObject, lastSourceObject) : this._defaultEqualityComparer(sourceObject, lastSourceObject);
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
            domainObject.afterSyncIfNeeded({ sourceObject, syncAttempted: !isAlreadyInSync, RDOChanged: changed });
        return changed;
    }
    /**
     *
     */
    synchronizeISyncableCollection({ sourceCollection, domainNodeCollection, makeRDOCollectionKey, makeRDO, }) {
        return _1.SyncUtils.synchronizeCollection({
            sourceCollection,
            getTargetCollectionSize: () => domainNodeCollection.size,
            getTargetCollectionKeys: domainNodeCollection.getKeys,
            makeRDOCollectionKeyFromSourceElement: makeRDOCollectionKey === null || makeRDOCollectionKey === void 0 ? void 0 : makeRDOCollectionKey.fromSourceElement,
            tryGetItemFromTargetCollection: (key) => domainNodeCollection.tryGetItemFromTargetCollection(key),
            insertItemToTargetCollection: (key, value) => domainNodeCollection.insertItemToTargetCollection(key, value),
            tryDeleteItemFromTargetCollection: (key) => domainNodeCollection.tryDeleteItemFromTargetCollection(key),
            makeItemForTargetCollection: makeRDO,
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
    synchronizeDomainMap({ sourceCollection, domainNodeCollection, makeRDOCollectionKey, makeRDO, }) {
        return _1.SyncUtils.synchronizeCollection({
            sourceCollection,
            getTargetCollectionSize: () => domainNodeCollection.size,
            getTargetCollectionKeys: () => Array.from(domainNodeCollection.keys()),
            makeRDOCollectionKeyFromSourceElement: makeRDOCollectionKey === null || makeRDOCollectionKey === void 0 ? void 0 : makeRDOCollectionKey.fromSourceElement,
            tryGetItemFromTargetCollection: (key) => domainNodeCollection.get(key),
            insertItemToTargetCollection: (key, value) => domainNodeCollection.set(key, value),
            tryDeleteItemFromTargetCollection: (key) => domainNodeCollection.delete(key),
            makeItemForTargetCollection: makeRDO,
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
    synchronizeDomainSet({ sourceCollection, domainNodeCollection, makeRDOCollectionKey, makeRDO, }) {
        return _1.SyncUtils.synchronizeCollection({
            sourceCollection,
            getTargetCollectionSize: () => domainNodeCollection.size,
            getTargetCollectionKeys: (makeRDOCollectionKey === null || makeRDOCollectionKey === void 0 ? void 0 : makeRDOCollectionKey.fromDomainElement) ? () => _1.CollectionUtils.Set.getKeys({ collection: domainNodeCollection, makeKey: makeRDOCollectionKey.fromDomainElement }) : undefined,
            makeRDOCollectionKeyFromSourceElement: makeRDOCollectionKey === null || makeRDOCollectionKey === void 0 ? void 0 : makeRDOCollectionKey.fromSourceElement,
            tryGetItemFromTargetCollection: (makeRDOCollectionKey === null || makeRDOCollectionKey === void 0 ? void 0 : makeRDOCollectionKey.fromDomainElement) ? (key) => _1.CollectionUtils.Set.tryGetItem({ collection: domainNodeCollection, makeKey: makeRDOCollectionKey.fromDomainElement, key })
                : undefined,
            insertItemToTargetCollection: (key, value) => _1.CollectionUtils.Set.insertItem({ collection: domainNodeCollection, key, value }),
            tryDeleteItemFromTargetCollection: (makeRDOCollectionKey === null || makeRDOCollectionKey === void 0 ? void 0 : makeRDOCollectionKey.fromDomainElement) ? (key) => _1.CollectionUtils.Set.tryDeleteItem({ collection: domainNodeCollection, makeKey: makeRDOCollectionKey.fromDomainElement, key })
                : undefined,
            makeItemForTargetCollection: makeRDO,
            trySyncElement: ({ sourceElementKey, sourceElementVal, targetElementKey, targetElementVal }) => this.trySynchronizeNode({
                sourceNodeKind: 'arrayElement',
                sourceNodeKey: sourceElementKey,
                sourceNodeVal: sourceElementVal,
                domainNodeKey: targetElementKey,
                domainNodeVal: targetElementVal,
                tryUpdateDomainNode: (key, value) => _1.CollectionUtils.Set.tryUpdateItem({ collection: domainNodeCollection, makeKey: makeRDOCollectionKey.fromDomainElement, value }),
            }),
        });
    }
    /**
     *
     */
    synchronizeDomainArray({ sourceCollection, domainNodeCollection, makeRDOCollectionKey, makeRDO, }) {
        return _1.SyncUtils.synchronizeCollection({
            sourceCollection,
            getTargetCollectionSize: () => domainNodeCollection.length,
            getTargetCollectionKeys: (makeRDOCollectionKey === null || makeRDOCollectionKey === void 0 ? void 0 : makeRDOCollectionKey.fromDomainElement) ? () => _1.CollectionUtils.Array.getKeys({ collection: domainNodeCollection, makeKey: makeRDOCollectionKey.fromDomainElement }) : undefined,
            makeRDOCollectionKeyFromSourceElement: makeRDOCollectionKey === null || makeRDOCollectionKey === void 0 ? void 0 : makeRDOCollectionKey.fromSourceElement,
            makeItemForTargetCollection: makeRDO,
            tryGetItemFromTargetCollection: (makeRDOCollectionKey === null || makeRDOCollectionKey === void 0 ? void 0 : makeRDOCollectionKey.fromDomainElement) ? (key) => _1.CollectionUtils.Array.getItem({ collection: domainNodeCollection, makeKey: makeRDOCollectionKey === null || makeRDOCollectionKey === void 0 ? void 0 : makeRDOCollectionKey.fromDomainElement, key })
                : undefined,
            insertItemToTargetCollection: (key, value) => _1.CollectionUtils.Array.insertItem({ collection: domainNodeCollection, key, value }),
            tryDeleteItemFromTargetCollection: (makeRDOCollectionKey === null || makeRDOCollectionKey === void 0 ? void 0 : makeRDOCollectionKey.fromDomainElement) ? (key) => _1.CollectionUtils.Array.deleteItem({ collection: domainNodeCollection, makeKey: makeRDOCollectionKey.fromDomainElement, key })
                : undefined,
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
            logger.warn('smartSync - sourceObject or RDO was null. Exiting', { rootSourceNode, rootSyncableObject: rootDomainNode });
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