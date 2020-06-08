import { Logger } from '../infrastructure/logger';
import { GraphSynchronizer, IGraphSyncOptions } from '..';
import { runInAction } from 'mobx';

const logger = Logger.make('MobxGraphSynchronizer');

export class MobxGraphSynchronizer extends GraphSynchronizer {
  // ------------------------------------------------------------------------------------------------------------------
  // CONSTRUCTOR
  // ------------------------------------------------------------------------------------------------------------------
  constructor(options?: IGraphSyncOptions) {
    super(options);
  }

  public smartSync<S extends Record<string, any>, D extends Record<string, any>>({ rootSourceNode, rootDomainNode }: { rootSourceNode: S; rootDomainNode: D }) {
    logger.trace('smartSync - entering action', { rootSourceNode, rootSyncableObject: rootDomainNode });
    runInAction('trySynchronizeObject', () => {
      super.smartSync({ rootSourceNode, rootDomainNode });
    });
    logger.trace('smartSync - action completed', { rootSourceNode, rootSyncableObject: rootDomainNode });
  }
}
