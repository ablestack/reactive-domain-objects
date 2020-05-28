import { observable } from 'mobx';
import { SyncableCollection } from '.';
import { GraphSynchronizer } from './graphSynchronizer';

// Define Test Source Data Types
type Publisher = { id: string; name: string };
type Book = { id: string; title: string; pages: number; publisher: Publisher };
type Author = { id: string; name: string; age: number; books: Book[] };
type MockWatchedQueryResult = { author: Author };

// Define Test Source Data Graph
const mockWatchedQueryResult: MockWatchedQueryResult = {
  author: {
    id: 'author-1',
    name: 'john smith',
    age: 50,
    books: [
      { id: 'book-1', title: 'book 1', pages: 100, publisher: { id: 'pub-1', name: 'mega-books' } },
      { id: 'book-2', title: 'book 2', pages: 200, publisher: { id: 'pub-1', name: 'super-books' } },
    ],
  },
};

// Define Test Domain Model objects
class PublisherDM {
  @observable public id: string;
  @observable public name: string;

  /*
    Any other domain-specific properties and methods here
  */
}

class BookDM {
  @observable public id: string;
  @observable public title: string;
  @observable public pages: number;
  @observable public publisher: PublisherDM;

  /*
    Any other domain-specific properties and methods here
  */
}

class AuthorDM {
  @observable public id$: string;
  @observable public name$: string;
  @observable public age$: number;
  public books: SyncableCollection<Book, BookDM> = new SyncableCollection({ makeItemKey: (book: Book) => book.id, makeItem: (book: Book) => new BookDM() });

  /*
    Any other domain-specific properties and methods here
  */
}

test('auto synchronize updates properties as expected', () => {
  console.log('starting test: auto synchronize updates properties as expected');

  const authorDM = new AuthorDM();
  expect(authorDM.id$).toBeUndefined();

  const graphSynchronizer = new GraphSynchronizer({ appendPrefixToObservableProperties: '$' });
  graphSynchronizer.synchronize({ rootDomainObject: authorDM, rootsourceObject: mockWatchedQueryResult.author });

  expect(authorDM.id$).toEqual(mockWatchedQueryResult.author.id);
});
