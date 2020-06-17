import _ from 'lodash';
import { IRdoCollectionNodeWrapper, ISyncChildNode, isISourceCollectionNodeWrapper } from '../..';
import { Logger } from '../../infrastructure/logger';

const logger = Logger.make('SyncUtils');

/** */
function synchronizeCollection<S, D>({ rdo, syncChildNode }: { rdo: IRdoCollectionNodeWrapper<S, D>; syncChildNode: ISyncChildNode<S, D> }) {
  let changed = false;
  const sourceKeys = new Array<string>();
  const targetCollectionStartedEmpty = rdo.childElementCount() === 0;

  if (rdo.wrappedSourceNode.childElementCount() > 0) {
    if (!isISourceCollectionNodeWrapper(rdo.wrappedSourceNode)) throw new Error('Can only sync Rdo collection types with Rdo source types');
    const sourceCollection = rdo.wrappedSourceNode.elements();

    for (const sourceItem of sourceCollection) {
      if (sourceItem === null || sourceItem === undefined) continue;
      // Make key

      const key = rdo.wrappedSourceNode.makeCollectionKey(sourceItem);
      if (!key) throw Error(`rdo.wrappedSourceNode.makeKey produced null or undefined. It must be defined when sourceCollection.length > 0`);

      // Track keys so can be used in target item removal later
      sourceKeys.push(key);

      // Get or create target item
      let targetItem: D | null | undefined = undefined;
      if (!targetCollectionStartedEmpty) {
        logger.trace(`sourceNodePath: ${rdo.wrappedSourceNode.sourceNodePath} - Found item ${key} in rdoCollection`, targetItem);
        targetItem = rdo.getElement(key);
      }
      if (!targetItem) {
        if (!rdo.makeRdo) throw Error(`sourceNodePath: ${rdo.wrappedSourceNode.sourceNodePath} - rdo.makeItem wan null or undefined. It must be defined when targetItem collection not empty`);
        targetItem = rdo.makeRdo(sourceItem);
        if (!targetItem) throw Error(`sourceNodePath: ${rdo.wrappedSourceNode.sourceNodePath} - rdo.targetItem produced null or undefined`);

        logger.trace(`sourceNodePath: ${rdo.wrappedSourceNode.sourceNodePath} - Adding item ${key} to collection`, targetItem);
        rdo.insertElement(key, targetItem);
      }

      //
      // Sync Item
      //
      logger.trace(`Syncing item ${key} in collection`, sourceItem);
      changed = syncChildNode({ parentRdoNode: rdo, rdoNodeItemValue: targetItem, rdoNodeItemKey: key, sourceNodeItemKey: key });
      continue;
    }
  }

  // short-cutting this check when initial collection was empty.
  // This id a performance optimization and also (indirectly)
  // allows for auto collection methods based on target item types
  if (!targetCollectionStartedEmpty) {
    if (!rdo.itemKeys) throw Error(`getTargetCollectionKeys wan null or undefined. It must be defined when targetCollection.length > 0`);
    if (!rdo.deleteElement) throw Error(`tryDeleteItemFromTargetCollection wan null or undefined. It must be defined when targetCollection.length > 0`);
    // If destination item missing from source - remove from destination
    const targetCollectionKeys = Array.from(rdo.itemKeys());
    const targetCollectionKeysInDestinationOnly = _.difference(targetCollectionKeys, sourceKeys);
    if (targetCollectionKeysInDestinationOnly.length > 0) {
      targetCollectionKeysInDestinationOnly.forEach((itemId) => {
        rdo.deleteElement(itemId);
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
