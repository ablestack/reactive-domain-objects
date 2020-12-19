import { ObservableQuery, ApolloClient } from '@apollo/client';
import uuid from 'uuid';
import { Logger } from '@ablestack/rdo/infrastructure/logger';
import { DeferredPromise } from '@ablestack/deferred-promise-ts';

const logger = Logger.make('ViewModelSyncUtils');

export class QueryWatcher<Q> {
  private _watchedQuery: ObservableQuery<Q> | undefined;
  private _watchedQuerySubscription: ZenObservable.Subscription | undefined;
  private readonly _deferredPromiseQueue: Array<DeferredPromise<Q | null | undefined>>;
  private _active: boolean = false;
  private _name: string;
  private _makeObservableQuery: (apolloClient: ApolloClient<object>) => Promise<ObservableQuery<Q>>;
  private _handleDataChange: (queryResult: Q | null | undefined) => void;
  private _onAfterInitialized?: (apolloClient: ApolloClient<object>) => void;
  private _onAfterStart?: (apolloClient: ApolloClient<object>) => void;
  private _onAfterStop?: (apolloClient: ApolloClient<object>) => void;
  private _uuid = uuid.v4();

  public get active(): boolean {
    return this._active;
  }

  constructor({
    name,
    makeObservableQuery,
    onAfterInitialized,
    onAfterStart: onStart,
    onDataChange,
    onAfterStop: onStop,
  }: {
    name: string;
    makeObservableQuery: (apolloClient: ApolloClient<object>) => Promise<ObservableQuery<Q>>;
    onAfterInitialized?: (apolloClient: ApolloClient<object>) => void;
    onAfterStart?: (apolloClient: ApolloClient<object>) => void;
    onDataChange: (queryResult: Q | null | undefined) => void;
    onAfterStop?: (apolloClient: ApolloClient<object>) => void;
  }) {
    this._deferredPromiseQueue = new Array<DeferredPromise<Q | null | undefined>>();
    this._name = name;
    this._makeObservableQuery = makeObservableQuery;
    this._onAfterInitialized = onAfterInitialized;
    this._onAfterStart = onStart;
    this._handleDataChange = onDataChange;
    this._onAfterStop = onStop;
  }

  //
  public async initialize(apolloClient: ApolloClient<object>) {
    if (!this._watchedQuery) {
      this._watchedQuery = await this._makeObservableQuery(apolloClient);
      logger.trace(`${this._name} - watchedQuery initialized`, this._watchedQuery);
    }
    if (this._onAfterInitialized) {
      await this._onAfterInitialized(apolloClient);
    }
  }

  /**
   *
   *
   * @param {ApolloClient<object>} apolloClient
   * @param {boolean} [force=false]  the force parameter will override any existing watch, and trigger a refetch of data even if data already available
   * @returns
   * @memberof QueryWatcher
   */
  public start(apolloClient: ApolloClient<object>, force: boolean) {
    if (this.active) return;

    this.initiateWatch({ apolloClient, runOnce: false, force });

    logger.trace(`${this._name} - Started`);

    if (this._onAfterStart) this._onAfterStart(apolloClient);
  }

  //
  public runOnce(apolloClient: ApolloClient<object>) {
    if (this.active) return;

    this.initiateWatch({ apolloClient, runOnce: true, force: true });

    logger.trace(`${this._name} - RunOnce`);

    if (this._onAfterStart) this._onAfterStart(apolloClient);
  }

  //
  public stop(apolloClient: ApolloClient<object>) {
    if (this._active) {
      this._watchedQuerySubscription?.unsubscribe();
      this._active = false;

      // Reject any queued promises
      if (this._deferredPromiseQueue.length > 0) {
        //
        this._deferredPromiseQueue.splice(0, this._deferredPromiseQueue.length).forEach((item) => item.reject('QueryWatcher stopped before DeferredPromise containing results resolved'));
      }

      logger.trace(`${this._name} - Stopped`);

      if (this._onAfterStop) this._onAfterStop(apolloClient);
    }
  }

  // The force parameter will trigger a refetch of data even if already available
  private initiateWatch({ apolloClient, runOnce, force }: { apolloClient: ApolloClient<object>; runOnce: boolean; force: boolean }) {
    if (!this._watchedQuery) {
      logger.error(`QueryWatcher must be initialized before use (${this._name})`, this._watchedQuery);
      return;
    }
    logger.info(`${this._name} - Starting`);

    if (!force && this._active) throw new Error(`queryWatch already active. To override an existing queryWatch session, set the 'force' parameter of the Start method to 'true'`);
    if (force) this._watchedQuery.resetLastResults();

    this._watchedQuerySubscription = this._watchedQuery.subscribe(
      (next) => {
        logger.trace(`${this._name} - watchedQuerySubscription - Result`, next);
        if (next.data) {
          this.onDataChange(next.data);
          if (runOnce) this.stop(apolloClient);
        }
      },
      (error) => {
        logger.error(`${this._name} - watchedQuerySubscription - ERROR`, error);
        this.stop(apolloClient);
      },
      () => {
        logger.info(`${this._name} - watchedQuerySubscription - Completed`);
        this.stop(apolloClient);
      },
    );
    this._active = true;
  }

  public async getNextResultAsync(): Promise<Q | null | undefined> {
    const deferredPromise = new DeferredPromise<Q | null | undefined>();
    this._deferredPromiseQueue.push(deferredPromise);
    return deferredPromise;
  }

  private onDataChange(queryResult: Q | null | undefined): void {
    // Call data change handlers
    this._handleDataChange(queryResult);

    // Resolve any queued promises
    if (this._deferredPromiseQueue.length > 0) {
      //
      this._deferredPromiseQueue.splice(0, this._deferredPromiseQueue.length).forEach((item) => item.resolve(queryResult));
    }
  }
}
