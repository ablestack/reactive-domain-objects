import _ from 'lodash';
import { Logger } from '../infrastructure/logger';
import { IRdoCollectionNodeWrapper, isISourceCollectionNodeWrapper, ISyncChildElement } from '../types';

const logger = Logger.make('SyncUtils');

/** */
function synchronizeCollection<S, D>({ rdo, syncChildElement }: { rdo: IRdoCollectionNodeWrapper<S, D>; syncChildElement: ISyncChildElement<S, D> }) {
  let changed = false;
  const sourceKeys = new Array<string>();
  const targetCollectionStartedEmpty = rdo.childElementCount() === 0;

  if (rdo.wrappedSourceNode.childElementCount() > 0) {
    if (!isISourceCollectionNodeWrapper(rdo.wrappedSourceNode)) throw new Error('Can only sync Rdo collection types with Rdo source types');
    const sourceCollection = rdo.wrappedSourceNode.elements();

    for (const sourceItem of sourceCollection) {
      if (sourceItem === null || sourceItem === undefined) continue;
      // Make key

      if (!rdo.wrappedSourceNode.makeItemKey) throw Error(`rdo.wrappedSourceNode.makeKey wan null or undefined. It must be defined when sourceCollection.length > 0`);
      const key = rdo.wrappedSourceNode.makeItemKey(sourceItem);

      // Track keys so can be used in target item removal later
      sourceKeys.push(key);

      // Get or create target item
      let targetItem: D | null | undefined = undefined;
      if (!targetCollectionStartedEmpty) {
        targetItem = rdo.getItem(key);
      }
      if (!targetItem) {
        if (!rdo.makeItem) throw Error(`rdo.makeItem wan null or undefined. It must be defined when targetItem collection not empty`);
        targetItem = rdo.makeItem(sourceItem);
        logger.trace(`Adding item ${key} to collection`, targetItem);
        rdo.insertItem(targetItem);
      }

      //
      // Sync Item
      //
      logger.trace(`Syncing item ${key} in collection`, sourceItem);
      changed = syncChildElement({ sourceElementKey: key, sourceElementVal: sourceItem, targetElementKey: key, targetElementVal: targetItem! });
      continue;
    }
  }

  // short-cutting this check when initial collection was empty.
  // This id a performance optimization and also (indirectly)
  // allows for auto collection methods based on target item types
  if (!targetCollectionStartedEmpty) {
    if (!rdo.itemKeys) throw Error(`getTargetCollectionKeys wan null or undefined. It must be defined when targetCollection.length > 0`);
    if (!rdo.deleteItem) throw Error(`tryDeleteItemFromTargetCollection wan null or undefined. It must be defined when targetCollection.length > 0`);
    // If destination item missing from source - remove from destination
    const targetCollectionKeys = Array.from(rdo.itemKeys());
    const targetCollectionKeysInDestinationOnly = _.difference(targetCollectionKeys, sourceKeys);
    if (targetCollectionKeysInDestinationOnly.length > 0) {
      targetCollectionKeysInDestinationOnly.forEach((itemId) => {
        rdo.deleteItem(itemId);
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
