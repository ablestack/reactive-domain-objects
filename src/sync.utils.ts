import _ from 'lodash';
import { Logger } from './logger';
import { IMakeKey } from '.';

const logger = Logger.make('SyncUtils');

/** */
function synchronizeCollection<S, T>({
  sourceCollection,
  getTargetCollectionKeys,
  makeKey,
  getItem,
  upsertItem,
  deleteItem,
  makeItem,
  trySyncElement,
}: {
  sourceCollection: Iterable<S>;
  getTargetCollectionKeys: () => string[];
  makeKey: (sourceItem: S) => string;
  getItem: (key: string) => T;
  upsertItem: (key: string, value: T) => void;
  deleteItem: (key: string) => void;
  makeItem: (s) => T;
  trySyncElement: ({ sourceElementKey, sourceElementVal, targetElementKey }: { sourceElementKey: string; sourceElementVal: S; targetElementKey: string }) => boolean;
}) {
  let changed = false;
  const sourceKeys = new Array<string>();

  for (const sourceItem of sourceCollection) {
    const key = makeKey(sourceItem);
    sourceKeys.push(key);

    const targetItem = getItem(key);

    //
    // Source item not present in destination
    //
    if (!targetItem) {
      const madeItem = makeItem(sourceItem);
      logger.trace(`Adding item ${key} to collection`, madeItem);
      upsertItem(key, madeItem);
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
      deleteItem(itemId);
    });
    changed = true;
  }

  return changed;
}

//
//
//
export const SyncUtils = { synchronizeCollection };
