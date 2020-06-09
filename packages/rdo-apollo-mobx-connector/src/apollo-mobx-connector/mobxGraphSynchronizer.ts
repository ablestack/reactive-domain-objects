import { Logger } from '@ablestack/rdo/infrastructure/logger';
import { GraphSynchronizer, IGraphSyncOptions } from '@ablestack/rdo';
import { runInAction } from 'mobx';

const logger = Logger.make('MobxGraphSynchronizer');

export class MobxGraphSynchronizer extends GraphSynchronizer {
  // ------------------------------------------------------------------------------------------------------------------
  // CONSTRUCTOR
  // ------------------------------------------------------------------------------------------------------------------
  constructor(options?: IGraphSyncOptions) {
    super(options);
  }

  public smartSync<S extends Record<string, any>, D extends Record<string, any>>({ rootSourceNode, rootRdo }: { rootSourceNode: S; rootRdo: D }) {
    logger.trace('smartSync - entering action', { rootSourceNode, rootSyncableObject: rootRdo });
    runInAction('trySynchronizeObject', () => {
      super.smartSync({ rootSourceNode, rootRdo });
    });
    logger.trace('smartSync - action completed', { rootSourceNode, rootSyncableObject: rootRdo });
  }
}
