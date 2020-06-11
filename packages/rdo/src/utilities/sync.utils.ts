import _ from 'lodash';
import { Logger } from '../infrastructure/logger';
import { IRdoCollectionNodeWrapper } from '../types';

const logger = Logger.make('SyncUtils');

/** */
function synchronizeCollection<S, T>({
  sourceCollection,
  targetRdoCollectionNodeWrapper,
  tryStepIntoElementAndSync,
}: {
  sourceCollection: Iterable<S>;
  targetRdoCollectionNodeWrapper: IRdoCollectionNodeWrapper<T>;
  tryStepIntoElementAndSync: ({ sourceElementKey, sourceElementVal, targetElementKey }: { sourceElementKey: string; sourceElementVal: S; targetElementKey: string; targetElementVal: T }) => boolean;
}) {
  let changed = false;
  const sourceKeys = new Array<string>();
  const targetCollectionStartedEmpty = targetRdoCollectionNodeWrapper.size() === 0;

  for (const sourceItem of sourceCollection) {
    if (sourceItem === null || sourceItem === undefined) continue;
    // Make key

    if (!makeTargetCollectionKeyFromSourceElement) throw Error(`makeTargetCollectionKeyFromSourceElement wan null or undefined. It must be defined when sourceCollection.length > 0`);
    const key = makeTargetCollectionKeyFromSourceElement(sourceItem);

    // Track keys so can be used in target item removal later
    sourceKeys.push(key);

    // Get or create target item
    let targetItem: T | null | undefined = undefined;
    if (!targetCollectionStartedEmpty) {
      targetItem = targetRdoCollectionNodeWrapper.getItem(key);
    }
    if (!targetItem) {
      targetItem = targetRdoCollectionNodeWrapper.makeItem(sourceItem);
      logger.trace(`Adding item ${key} to collection`, targetItem);
      targetRdoCollectionNodeWrapper.insertItem(targetItem);
    }

    //
    // Sync Item
    //
    logger.trace(`Syncing item ${key} in collection`, sourceItem);
    changed = tryStepIntoElementAndSync({ sourceElementKey: key, sourceElementVal: sourceItem, targetElementKey: key, targetElementVal: targetItem! });
    continue;
  }

  // short-cutting this check when initial collection was empty.
  // This id a performance optimization and also (indirectly)
  // allows for auto collection methods based on target item types
  if (!targetCollectionStartedEmpty) {
    if (!targetRdoCollectionNodeWrapper.keys) throw Error(`getTargetCollectionKeys wan null or undefined. It must be defined when targetCollection.length > 0`);
    if (!targetRdoCollectionNodeWrapper.deleteItem) throw Error(`tryDeleteItemFromTargetCollection wan null or undefined. It must be defined when targetCollection.length > 0`);
    // If destination item missing from source - remove from destination
    const targetCollectionKeys = Array.from(targetRdoCollectionNodeWrapper.keys());
    const targetCollectionKeysInDestinationOnly = _.difference(targetCollectionKeys, sourceKeys);
    if (targetCollectionKeysInDestinationOnly.length > 0) {
      targetCollectionKeysInDestinationOnly.forEach((itemId) => {
        targetRdoCollectionNodeWrapper.deleteItem(itemId);
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
