import { observable } from 'mobx';
import { SyncableCollection, GraphSynchronizer } from '../src';
import { Logger } from '../src/logger';
import { AuthorDomainModel, mockWatchedQueryResult, LibraryDomainModel, BookDomainModel } from '.';
import { Book } from './test-types';

const logger = Logger.make('autoSynchronize.test.ts');

// --------------------------------------------------------------
// TESTS
// --------------------------------------------------------------

test('auto synchronize updates properties as expected', () => {
  const libraryDomainModel = new LibraryDomainModel();

  expect(libraryDomainModel.name).toBeFalsy();
  expect(libraryDomainModel.city$).toBeFalsy();
  expect(libraryDomainModel.authors.size$).toBeFalsy();

  const graphSynchronizer = new GraphSynchronizer({
    pathMap: [{ path: 'library.author.book', options: { domainObjectCreation: { makeKey: (author: Book) => author.id, makeItem: (book: Book) => new BookDomainModel() } } }],
    globalPropertyNameTransformations: { tryStandardPostfix: '$' },
  });
  graphSynchronizer.synchronize({ rootDomainObject: libraryDomainModel, rootsourceObject: mockWatchedQueryResult.library });

  expect(libraryDomainModel.name).not.toBeFalsy();
  expect(libraryDomainModel.city$).not.toBeFalsy();
  expect(libraryDomainModel.authors.size$).not.toBeFalsy();

  expect(libraryDomainModel.name).toEqual(mockWatchedQueryResult.library.name);
  expect(libraryDomainModel.city$).toEqual(mockWatchedQueryResult.library.city);
  expect(libraryDomainModel.authors.size$).toEqual(3);

  expect(libraryDomainModel.authors.array$[0].books[0].id).toEqual(mockWatchedQueryResult.library.authors[0].books[0].id);
  expect(libraryDomainModel.authors.array$[0].books[0].title$).toEqual(mockWatchedQueryResult.library.authors[0].books[0].title);
  expect(libraryDomainModel.authors.array$[0].books[0].publisher).toBeDefined();
  expect(libraryDomainModel.authors.array$[0].books[0].publisher.id).toEqual(mockWatchedQueryResult.library.authors[0].books[0].publisher.id);
  expect(libraryDomainModel.authors.array$[0].books[0].publisher.name$).toEqual(mockWatchedQueryResult.library.authors[0].books[0].publisher.name);
});

//
//
//
test('performance', () => {
  // Setup
  const iterations = 10000;
  const authorDomainModel = new AuthorDomainModel();
  const graphSynchronizer = new GraphSynchronizer({ globalPropertyNameTransformations: { tryStandardPostfix: '$' } });

  const startTime = performance.now();

  // Execute
  for (let i = 0; i < iterations; i++) {
    graphSynchronizer.synchronize({ rootDomainObject: authorDomainModel, rootsourceObject: mockWatchedQueryResult.library.authors[0] });
  }

  // Assess
  const finishTime = performance.now();
  const totalTimeMs = Math.round(finishTime - startTime);

  logger.info(`${iterations} graphSynchronizer.synchronize iterations: totalTime: ${totalTimeMs} ms (${totalTimeMs / 1000}s) = per iteration ${totalTimeMs / iterations}ms (${totalTimeMs / iterations / 1000}) `);
});
