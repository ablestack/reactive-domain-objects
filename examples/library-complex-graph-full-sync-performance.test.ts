import { GraphSynchronizer } from '@ablestack/rdo';
import { Logger } from '@ablestack/rdo/infrastructure/logger';
import { SyncableCollection } from '@ablestack/rdo-apollo-mobx-connector';
import _ from 'lodash';

const logger = Logger.make('library-complex-graph-full-sync-performance.test.ts');

const FULL_SYNC_ITERATION_COUNT = 500;
const FULL_SYNC_MAX_TIME_MS = 5000;

// -----------------------------------
// Source Data Models
// -----------------------------------
type Publisher = { id: string; name: string };
type Book = { id: string; title: string; pages: number; publisher: Publisher; __type: string };
type Author = { id: string; name: string; age: number; books: Book[] };
type Library = { name: string; city: string; capacity: number; code: string; authors: Author[] };

// -----------------------------------
// Source Data
// -----------------------------------
const librarySourceJSON: Library = {
  name: 'city-library',
  city: 'niceville',
  capacity: 100,
  code: 'ncl-1',
  authors: [
    {
      id: 'author-js',
      name: 'john smith',
      age: 50,
      books: [
        { id: 'book-js-0', title: 'book 0', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
        { id: 'book-js-1', title: 'book 1', pages: 100, publisher: { id: 'pub-1', name: 'mega-books' }, __type: 'Book' },
        { id: 'book-js-2', title: 'book 2', pages: 200, publisher: { id: 'pub-2', name: 'super-books' }, __type: 'Book' },
        { id: 'book-js-3', title: 'book 3', pages: 200, publisher: { id: 'pub-1', name: 'mega-books' }, __type: 'Book' },
        { id: 'book-js-4', title: 'book 4', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
        { id: 'book-js-5', title: 'book 5', pages: 200, publisher: { id: 'pub-2', name: 'mega-books' }, __type: 'Book' },
        { id: 'book-js-6', title: 'book 6', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
        { id: 'book-js-7', title: 'book 7', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
        { id: 'book-js-8', title: 'book 8', pages: 200, publisher: { id: 'pub-2', name: 'mega-books' }, __type: 'Book' },
        { id: 'book-js-9', title: 'book 9', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
      ],
    },
    {
      id: 'author-jf',
      name: 'jane foo',
      age: 50,
      books: [
        { id: 'book-jf-0', title: 'book 0', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
        { id: 'book-jf-1', title: 'book 1', pages: 100, publisher: { id: 'pub-1', name: 'mega-books' }, __type: 'Book' },
        { id: 'book-jf-2', title: 'book 2', pages: 200, publisher: { id: 'pub-2', name: 'super-books' }, __type: 'Book' },
        { id: 'book-jf-3', title: 'book 3', pages: 200, publisher: { id: 'pub-1', name: 'mega-books' }, __type: 'Book' },
        { id: 'book-jf-4', title: 'book 4', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
        { id: 'book-jf-5', title: 'book 5', pages: 200, publisher: { id: 'pub-2', name: 'mega-books' }, __type: 'Book' },
        { id: 'book-jf-6', title: 'book 6', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
        { id: 'book-jf-7', title: 'book 7', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
        { id: 'book-jf-8', title: 'book 8', pages: 200, publisher: { id: 'pub-2', name: 'mega-books' }, __type: 'Book' },
        { id: 'book-jf-9', title: 'book 9', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
      ],
    },
    {
      id: 'author-ss',
      name: 'shari s',
      age: 50,
      books: [
        { id: 'book-ss-0', title: 'book 0', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
        { id: 'book-ss-1', title: 'book 1', pages: 100, publisher: { id: 'pub-1', name: 'mega-books' }, __type: 'Book' },
        { id: 'book-ss-2', title: 'book 2', pages: 200, publisher: { id: 'pub-2', name: 'super-books' }, __type: 'Book' },
        { id: 'book-ss-3', title: 'book 3', pages: 200, publisher: { id: 'pub-1', name: 'mega-books' }, __type: 'Book' },
        { id: 'book-ss-4', title: 'book 4', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
        { id: 'book-ss-5', title: 'book 5', pages: 200, publisher: { id: 'pub-2', name: 'mega-books' }, __type: 'Book' },
        { id: 'book-ss-6', title: 'book 6', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
        { id: 'book-ss-7', title: 'book 7', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
        { id: 'book-ss-8', title: 'book 8', pages: 200, publisher: { id: 'pub-2', name: 'mega-books' }, __type: 'Book' },
        { id: 'book-ss-9', title: 'book 9', pages: 200, publisher: { id: 'pub-1', name: 'super-books' }, __type: 'Book' },
      ],
    },
  ],
};

// -----------------------------------
// Reactive Domain Object Graph
// -----------------------------------
class PublisherRDO {
  public id: string = '';
  public name$: string = '';
}

// -----

class BookRDO {
  public id: string = '';

  // Title. Using Getter/Setter so we can use a testing spy
  private _title$: string = '';
  public get title$(): string {
    return this._title$;
  }
  public set title$(value: string) {
    this._title$ = value;
  }

  // pages. Using Getter/Setter so we can use a testing spy
  private _pages$: number = 0;
  public get pages$(): number {
    return this._pages$;
  }
  public set pages$(value: number) {
    this._pages$ = value;
  }

  public publisher: PublisherRDO = new PublisherRDO();

  /* Any other domain-specific properties and methods here */
}

// -----

class AuthorRDO {
  public id: string = '';

  private _name$: string = '';
  public get name$(): string {
    return this._name$;
  }
  public set name$(value: string) {
    this._name$ = value;
  }

  private _age$: number = 0;
  public get age$(): number {
    return this._age$;
  }
  public set age$(value: number) {
    this._age$ = value;
  }

  public books = new Array<BookRDO>();

  /* Any other domain-specific properties and methods here */
}

// -----

class LibraryRDO {
  // Using public variable
  public name: string = '';

  // Using Observable $ naming convention
  public city$: string = '';

  // Using Observable $ naming convention with Getter/Setter
  private _code$: string = '';
  public get code$(): string {
    return this._code$;
  }
  public set code$(value: string) {
    this._code$ = value;
  }

  // Using Getter/Setter
  private _capacity: number = 0;
  public get capacity(): number {
    return this._capacity;
  }
  public set capacity(value: number) {
    this._capacity = value;
  }

  public authors: SyncableCollection<Author, AuthorRDO> = new SyncableCollection({
    makeCollectionKeyFromSourceElement: (author: Author) => author.id,
    makeCollectionKeyFromRdoElement: (author: AuthorRDO) => author.id,
    makeRdo: (book: Author) => new AuthorRDO(),
  });

  /* Any other domain-specific properties and methods here */
}

// --------------------------------------------------------------
// CONFIG
// --------------------------------------------------------------
const config = {
  targetedNodeOptions: [{ sourceNodeMatcher: { nodePath: 'authors.books' }, makeRdo: (book: Book) => new BookRDO() }],
  globalNodeOptions: { commonRdoFieldnamePostfix: '$' },
};

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------

test(`achieves more than ${FULL_SYNC_ITERATION_COUNT} FULL synchronizations in ${FULL_SYNC_MAX_TIME_MS / 1000} or less, on a medium sized graph`, () => {
  // SETUP
  const iterations = FULL_SYNC_ITERATION_COUNT;
  const libraryRDO = new LibraryRDO();
  const graphSynchronizer = new GraphSynchronizer(config);

  // initiate a smart sync
  graphSynchronizer.smartSync({ rootRdo: libraryRDO, rootSourceNode: librarySourceJSON });

  // setup spys to ensure the data is actually being set as expected
  const authors_2_books_7_pages_spy_set = jest.spyOn(libraryRDO.authors.array$[2].books[7], 'pages$', 'set');
  const authors_2_books_8_pages_spy_set = jest.spyOn(libraryRDO.authors.array$[2].books[8], 'pages$', 'set');
  const authors_2_books_9_pages_spy_set = jest.spyOn(libraryRDO.authors.array$[2].books[9], 'pages$', 'set');

  // clone library for edits
  const libraryWithEdits = _.cloneDeep(librarySourceJSON);

  // EXECUTE
  const startTime = performance.now();

  for (let i = 0; i < iterations; i++) {
    // clear the tracked data
    graphSynchronizer.clearTrackedData();

    // change some values to get around the source -> domain value check for primitive types, allowing the spying on the set methods to be hit
    libraryWithEdits.authors[2].books[7].pages = i;
    libraryWithEdits.authors[2].books[8].pages = i;
    libraryWithEdits.authors[2].books[9].pages = i;

    // initiate a smart sync
    graphSynchronizer.smartSync({ rootRdo: libraryRDO, rootSourceNode: libraryWithEdits });
  }

  const finishTime = performance.now();
  const totalTimeMs = Math.round(finishTime - startTime);

  // VERIFY
  logger.info(
    `Full Sync ${iterations} graphSynchronizer.smartSync iterations - TotalTime: ${totalTimeMs} milliseconds (${totalTimeMs / 1000} seconds). Mean average per iteration: ${totalTimeMs / iterations} milliseconds (${
      totalTimeMs / iterations / 1000
    } seconds) `,
  );

  // Verify timing
  expect(totalTimeMs).toBeLessThan(FULL_SYNC_MAX_TIME_MS);

  // Verify changes were made as expected (indicating the full sync did actually occur)
  expect(authors_2_books_7_pages_spy_set).toHaveBeenCalledTimes(iterations);
  expect(authors_2_books_8_pages_spy_set).toHaveBeenCalledTimes(iterations);
  expect(authors_2_books_9_pages_spy_set).toHaveBeenCalledTimes(iterations);
  expect(libraryRDO.authors.array$[2].books[8].pages$).toEqual(libraryWithEdits.authors[2].books[8].pages);
});
