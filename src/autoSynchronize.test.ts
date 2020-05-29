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
  public id: string = '';
  @observable public name$: string = '';

  /*
    Any other domain-specific properties and methods here
  */
}

class BookDM {
  public id: string = '';
  @observable public title$: string = '';
  @observable public pages$: number = 0;
  public publisher: PublisherDM = new PublisherDM();

  /*
    Any other domain-specific properties and methods here
  */
}

class AuthorDM {
  public id: string = '';
  public name$: string = '';
  public age$: number = 0;
  public books: SyncableCollection<Book, BookDM> = new SyncableCollection({ makeItemKey: (book: Book) => book.id, makeItem: (book: Book) => new BookDM() });

  /*
    Any other domain-specific properties and methods here
  */
}

test('auto synchronize updates properties as expected', () => {
  console.log('starting test: auto synchronize updates properties as expected');

  const authorDM = new AuthorDM();
  expect(authorDM.id).toBeFalsy();
  expect(authorDM.name$).toBeFalsy();
  expect(authorDM.books.size$).toBeFalsy();

  const graphSynchronizer = new GraphSynchronizer({ globalPropertyNameTransformations: { tryStandardPostfix: '$' } });
  graphSynchronizer.synchronize({ rootDomainObject: authorDM, rootsourceObject: mockWatchedQueryResult.author });

  expect(authorDM.id).not.toBeFalsy();
  expect(authorDM.name$).not.toBeFalsy();
  expect(authorDM.books.size$).not.toBeFalsy();

  expect(authorDM.id).toEqual(mockWatchedQueryResult.author.id);
  expect(authorDM.age$).toEqual(mockWatchedQueryResult.author.age);
  expect(authorDM.books.size$).toEqual(2);

  expect(authorDM.books.array$[0].id).toEqual(mockWatchedQueryResult.author.books[0].id);
  expect(authorDM.books.array$[0].title$).toEqual(mockWatchedQueryResult.author.books[0].title);
  expect(authorDM.books.array$[0].publisher).toBeDefined();
  expect(authorDM.books.array$[0].publisher.id).toEqual(mockWatchedQueryResult.author.books[0].publisher.id);
  expect(authorDM.books.array$[0].publisher.name$).toEqual(mockWatchedQueryResult.author.books[0].publisher.name);
});
