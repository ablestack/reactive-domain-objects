import { observable } from 'mobx';
import { SyncableCollection } from '../src';
import { Book } from '.';

// Define Test Domain Model objects
export class PublisherDM {
  public id: string = '';
  @observable public name$: string = '';

  /*
      Any other domain-specific properties and methods here
    */
}

export class BookDM {
  public id: string = '';
  @observable public title$: string = '';
  @observable public pages$: number = 0;
  public publisher: PublisherDM = new PublisherDM();

  /*
      Any other domain-specific properties and methods here
    */
}

export class AuthorDM {
  public id: string = '';
  public name$: string = '';
  public age$: number = 0;
  public books: SyncableCollection<Book, BookDM> = new SyncableCollection({ makeItemKey: (book: Book) => book.id, makeItem: (book: Book) => new BookDM() });

  /*
      Any other domain-specific properties and methods here
    */
}
