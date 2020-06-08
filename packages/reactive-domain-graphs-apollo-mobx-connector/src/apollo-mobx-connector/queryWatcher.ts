import { ObservableQuery, ApolloClient } from '@apollo/client';
import uuid from 'uuid';
import { Logger } from '../infrastructure/logger';

const logger = Logger.make('ViewModelSyncUtils');

export class QueryWatcher<Q> {
  private _watchedQuery: ObservableQuery<Q> | undefined;
  private _watchedQuerySubscription: ZenObservable.Subscription | undefined;
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
    this._name = name;
    this._makeObservableQuery = makeObservableQuery;
    this._onAfterInitialized = onAfterInitialized;
    this._onAfterStart = onStart;
    this._handleDataChange = onDataChange;
    this._onAfterStop = onStop;
  }

  public async initialize(apolloClient: ApolloClient<object>) {
    if (!this._watchedQuery) {
      this._watchedQuery = await this._makeObservableQuery(apolloClient);
      logger.trace(`${this._name} - watchedQuery initialized`, this._watchedQuery);
    }
    if (this._onAfterInitialized) {
      await this._onAfterInitialized(apolloClient);
    }
  }

  public start(apolloClient: ApolloClient<object>) {
    if (this.active) return;

    if (!this._watchedQuery) {
      logger.error(`QueryWatcher must be initialized before use (${this._name})`, this._watchedQuery);
      return;
    }
    logger.trace(`${this._name} - Starting`);

    this._watchedQuery.resetLastResults();

    this._watchedQuerySubscription = this._watchedQuery.subscribe(
      (next) => {
        logger.trace(`${this._name} - watchedQuerySubscription - Result`, next);
        if (next.data) {
          this._handleDataChange(next.data);
        }
      },
      (error) => {
        logger.error(`${this._name} - watchedQuerySubscription - ERROR`);
      },
      () => {
        logger.error(`${this._name} - watchedQuerySubscription - Completed`);
      },
    );
    this._active = true;

    logger.trace(`${this._name} - Started`);

    if (this._onAfterStart) this._onAfterStart(apolloClient);
  }

  //
  public stop(apolloClient: ApolloClient<object>) {
    if (this._active) {
      this._watchedQuerySubscription?.unsubscribe();
      this._active = false;

      logger.trace(`${this._name} - Stopped`);

      if (this._onAfterStop) this._onAfterStop(apolloClient);
    }
  }
}
