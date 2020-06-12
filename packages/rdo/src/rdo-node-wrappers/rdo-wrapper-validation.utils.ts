import { config } from '../static.config';
import { Logger } from '../infrastructure/logger';

const logger = Logger.make('RdoWrapperValidationUtils');

function nonKeyedCollectionSizeCheck({ collectionSize, collectionType }: { collectionSize: number; collectionType: string }) {
  if (collectionSize > config.non_keyed_collection_warning_size_threashold)
    logger.warn(
      `Path: '${collectionType}', collection size:${collectionSize}, type: ${this.typeInfo.builtInType}. It is recommended that Map or Custom collections types are used in the RDOs for large collections. Set and Array collections will perform less well with large collections`,
    );
}

export const RdoWrapperValidationUtils = { nonKeyedCollectionSizeCheck };
