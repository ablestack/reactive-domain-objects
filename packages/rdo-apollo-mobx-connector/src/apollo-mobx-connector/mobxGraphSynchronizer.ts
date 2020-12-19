import { Logger } from '@ablestack/rdo/infrastructure/logger';
import { GraphSynchronizer, IGraphSyncOptions } from '@ablestack/rdo';
import { runInAction } from 'mobx';

const logger = Logger.make('MobxGraphSynchronizer');

export class MobxGraphSynchronizer extends GraphSynchronizer {
  // ------------------------------------------------------------------------------------------------------------------
  // CONSTRUCTOR
  // ------------------------------------------------------------------------------------------------------------------
  constructor(options?: IGraphSyncOptions) {
    // Set '$' as commonRdoFieldnamePostfix unless alternative supplied
    const opt = options?.globalNodeOptions?.commonRdoFieldnamePostfix ? options : { ...options, globalNodeOptions: { commonRdoFieldnamePostfix: '$' } };
    super(opt);
  }

  public smartSync<S extends Record<string, any>, D extends Record<string, any>>({ rootSourceNode, rootRdo }: { rootSourceNode: S; rootRdo: D }) {
    logger.trace('smartSync - entering action', { rootSourceNode, rootSyncableObject: rootRdo });
    runInAction(() => {
      logger.trace('smartSync - entering runInAction', { rootSourceNode, rootSyncableObject: rootRdo });
      super.smartSync({ rootSourceNode, rootRdo });
    });
    logger.trace('smartSync - action completed', { rootSourceNode, rootSyncableObject: rootRdo });
  }
}
