import _ from 'lodash';
import { Logger } from './logger';
import { IMakeKey } from '.';

const logger = Logger.make('SyncUtils');

/** */
function synchronizeCollection<S, T>({
  sourceCollection,
  getTargetCollectionSize,
  getTargetCollectionKeys,
  makeKeyFromSourceNode,
  makeItemForTargetCollection,
  tryGetItemFromTargetCollection,
  insertItemToTargetCollection,
  tryDeleteItemFromTargetCollection,
  trySyncElement,
}: {
  sourceCollection: Iterable<S>;
  getTargetCollectionSize: () => number;
  getTargetCollectionKeys: () => string[];
  makeKeyFromSourceNode: (sourceItem: S) => string;
  makeItemForTargetCollection: (s) => T;
  tryGetItemFromTargetCollection: (key: string) => T;
  insertItemToTargetCollection: (key: string, value: T) => void;
  tryDeleteItemFromTargetCollection: (key: string) => void;
  trySyncElement: ({ sourceElementKey, sourceElementVal, targetElementKey }: { sourceElementKey: string; sourceElementVal: S; targetElementKey: string; targetElementVal: T }) => boolean;
}) {
  let changed = false;
  const sourceKeys = new Array<string>();
  const targetCollectionStartedEmpty = getTargetCollectionSize() === 0;

  for (const sourceItem of sourceCollection) {
    if (sourceItem === null || sourceItem === undefined) continue;
    // Make key
    const key = makeKeyFromSourceNode(sourceItem);

    // Track keys so can be used in target item removal later
    sourceKeys.push(key);

    // Get or create target item
    let targetItem: T | undefined = undefined;
    if (!targetCollectionStartedEmpty) targetItem = tryGetItemFromTargetCollection(key);
    if (!targetItem) {
      targetItem = makeItemForTargetCollection(sourceItem);
      logger.trace(`Adding item ${key} to collection`, targetItem);
      insertItemToTargetCollection(key, targetItem);
    }

    //
    // Sync Item
    //
    logger.trace(`Syncing item ${key} in collection`, sourceItem);
    changed = trySyncElement({ sourceElementKey: key, sourceElementVal: sourceItem, targetElementKey: key, targetElementVal: targetItem! });
    continue;
  }

  // short-cutting this check when initial collection was empty.
  // This id a performance optimization and also (indirectly)
  // allows for default collection methods based on target item types
  if (!targetCollectionStartedEmpty) {
    // If destination item missing from source - remove from destination
    const destinationInstanceIds = getTargetCollectionKeys();
    const instanceIdsInDestinationOnly = _.difference(destinationInstanceIds, sourceKeys);
    if (instanceIdsInDestinationOnly.length > 0) {
      instanceIdsInDestinationOnly.forEach((itemId) => {
        tryDeleteItemFromTargetCollection(itemId);
      });
      changed = true;
    }
  }

  return changed;
}

//
//
//
export const SyncUtils = { synchronizeCollection };
