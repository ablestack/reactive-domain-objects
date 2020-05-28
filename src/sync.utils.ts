import _ from 'lodash';
import { Logger } from './logger';

const logger = Logger.make('SyncUtils');

/** */
function synchronizeCollection<S, T>({
  sourceCollection,
  getTargetCollectionKeys,
  makeItemKey,
  getItem,
  setItem,
  deleteItem,
  makeItem,
  trySyncProperty,
}: {
  sourceCollection: Iterable<S>;
  getTargetCollectionKeys: () => string[];
  makeItemKey: (sourceItem: S) => string;
  getItem: (key: string) => T;
  setItem: (key: string, value: T) => void;
  deleteItem: (key: string) => void;
  makeItem: (s) => T;
  trySyncProperty: ({ sourceItemKey, targetItemKey }: { sourceItemKey: string; targetItemKey: string }) => boolean;
}) {
  let changed = false;
  const sourceKeys = new Array<string>();

  for (const sourceItem of sourceCollection) {
    const key = makeItemKey(sourceItem);
    sourceKeys.push(key);

    const targetItem = getItem(key);

    // Source item not present in destination
    if (!targetItem) {
      setItem(key, makeItem(sourceItem));
      changed = true;
      continue;
    }

    changed = trySyncProperty({ sourceItemKey: key, targetItemKey: key });
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
