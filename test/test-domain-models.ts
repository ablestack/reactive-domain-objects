import { observable } from 'mobx';
import { SyncableCollection } from '../src';
import { Book, Author } from '.';

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
  @observable public name$: string = '';
  @observable public age$: number = 0;
  @observable public books = new Array<BookDomainModel>();

  /*
      Any other domain-specific properties and methods here
    */
}

export class LibraryDomainModel {
  public name: string = '';
  @observable public city$: string = '';
  public authors: SyncableCollection<Author, AuthorDomainModel> = new SyncableCollection({
    makeKeyFromSourceElement: (author: Author) => author.id,
    makeTargetCollectionItemFromSourceItem: (book: Author) => new AuthorDomainModel(),
  });

  /*
      Any other domain-specific properties and methods here
    */
}
