import { GraphSynchronizer } from '@ablestack/rdo';
import { Logger } from '@ablestack/rdo/infrastructure/logger';
import { SyncableCollection } from '@ablestack/rdo-apollo-mobx-connector';
import _ from 'lodash';

const logger = Logger.make('map-sync.test.ts');

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

test('Synchronize only updated properties only where source data changed', () => {
  const libraryRDO = new LibraryRDO();
  const graphSynchronizer = new GraphSynchronizer(config);
  // Initial data load
  graphSynchronizer.smartSync({ rootRdo: libraryRDO, rootSourceNode: librarySourceJSON });

  // Add method spies
  const library_code_spy_set = jest.spyOn(libraryRDO, 'code$', 'set');
  const library_capacity_spy_set = jest.spyOn(libraryRDO, 'capacity', 'set');

  const authors_0_age_spy_set = jest.spyOn(libraryRDO.authors.array$[0], 'age$', 'set');
  const authors_0_name_spy_set = jest.spyOn(libraryRDO.authors.array$[0], 'name$', 'set');

  const authors_0_books_0_title_spy_set = jest.spyOn(libraryRDO.authors.array$[0].books[0], 'title$', 'get');

  // Mutate data
  const libraryWithEdits = _.cloneDeep(librarySourceJSON);
  libraryWithEdits.code = libraryWithEdits.code + ' - changed';
  libraryWithEdits.authors[0].age = libraryWithEdits.authors[0].age + 2;

  // EXECUTE
  // update
  graphSynchronizer.smartSync({ rootRdo: libraryRDO, rootSourceNode: libraryWithEdits });

  // RESULTS VERIFICATION
  expect(library_code_spy_set).toHaveBeenCalled();
  expect(library_capacity_spy_set).not.toHaveBeenCalled();

  expect(authors_0_age_spy_set).toHaveBeenCalled();
  expect(authors_0_name_spy_set).not.toHaveBeenCalled();
  expect(authors_0_books_0_title_spy_set).not.toHaveBeenCalled(); // This should not have been called, because the isEqual algorithm further up the graph should have determined no change, and so not traversed up the node tree to this point
});
