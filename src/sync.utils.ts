import _ from 'lodash';
import { Logger } from './logger';
import { IMakeKey } from '.';

const logger = Logger.make('SyncUtils');

/** */
function synchronizeCollection<S, T>({
  sourceCollection,
  getTargetCollectionKeys,
  makeKeyFromSourceElement,
  makeKeyFromTargetElement,
  getItemFromTargetCollection,
  insertItemToTargetCollection,
  deleteItemFromTargetCollection,
  makeTargetCollectionItemFromSourceItem,
  trySyncElement,
}: {
  sourceCollection: Iterable<S>;
  getTargetCollectionKeys: () => string[];
  makeKeyFromSourceElement: (sourceItem: S) => string;
  makeKeyFromTargetElement?: (targetItem: T) => string;
  getItemFromTargetCollection: (key: string) => T;
  insertItemToTargetCollection: (key: string, value: T) => void;
  deleteItemFromTargetCollection: (key: string) => void;
  makeTargetCollectionItemFromSourceItem: (s) => T;
  trySyncElement: ({ sourceElementKey, sourceElementVal, targetElementKey }: { sourceElementKey: string; sourceElementVal: S; targetElementKey: string }) => boolean;
}) {
  let changed = false;
  const sourceKeys = new Array<string>();

  for (const sourceItem of sourceCollection) {
    const key = makeKeyFromSourceElement(sourceItem);
    sourceKeys.push(key);

    const targetItem = getItemFromTargetCollection(key);

    //
    // Source item not present in destination
    //
    if (!targetItem) {
      const madeItem = makeTargetCollectionItemFromSourceItem(sourceItem);
      logger.trace(`Adding item ${key} to collection`, madeItem);
      insertItemToTargetCollection(key, madeItem);
    }

    //
    // Sync Item
    //
    logger.trace(`Syncing item ${key} in collection`, sourceItem);
    changed = trySyncElement({ sourceElementKey: key, sourceElementVal: sourceItem, targetElementKey: key });
    continue;
  }

  // If destination item missing from source - remove from destination
  const destinationInstanceIds = getTargetCollectionKeys();
  const instanceIdsInDestinationOnly = _.difference(destinationInstanceIds, sourceKeys);
  if (instanceIdsInDestinationOnly.length > 0) {
    instanceIdsInDestinationOnly.forEach((itemId) => {
      deleteItemFromTargetCollection(itemId);
    });
    changed = true;
  }

  return changed;
}

//
//
//
export const SyncUtils = { synchronizeCollection };
