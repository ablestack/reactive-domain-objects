import { observable } from 'mobx';
import { SyncableCollection } from '../src';
import { Book } from '.';

// Define Test Domain Model objects
export class PublisherDomainModel {
  public id: string = '';
  @observable public name$: string = '';

  /*
      Any other domain-specific properties and methods here
    */
}

export class BookDomainModel {
  public id: string = '';
  @observable public title$: string = '';
  @observable public pages$: number = 0;
  public publisher: PublisherDomainModel = new PublisherDomainModel();

  /*
      Any other domain-specific properties and methods here
    */
}

export class AuthorDomainModel {
  public id: string = '';
  public name$: string = '';
  public age$: number = 0;
  public books: SyncableCollection<Book, BookDomainModel> = new SyncableCollection({ makeItemKey: (book: Book) => book.id, makeItem: (book: Book) => new BookDomainModel() });

  /*
      Any other domain-specific properties and methods here
    */
}

export class LibraryDomainModel {
  public id: string = '';
  public name$: string = '';
  public age$: number = 0;
  public books: SyncableCollection<Book, BookDomainModel> = new SyncableCollection({ makeItemKey: (book: Book) => book.id, makeItem: (book: Book) => new BookDomainModel() });

  /*
      Any other domain-specific properties and methods here
    */
}
