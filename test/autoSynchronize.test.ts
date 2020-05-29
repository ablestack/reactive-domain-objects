import { observable } from 'mobx';
import { SyncableCollection, GraphSynchronizer } from '../src';
import { Logger } from '../src/logger';
import { AuthorDomainModel, mockWatchedQueryResult } from '.';

const logger = Logger.make('autoSynchronize.test.ts');

// --------------------------------------------------------------
// TESTS
// --------------------------------------------------------------

test('auto synchronize updates properties as expected', () => {
  const authorDomainModel = new AuthorDomainModel();
  expect(authorDomainModel.id).toBeFalsy();
  expect(authorDomainModel.name$).toBeFalsy();
  expect(authorDomainModel.books.size$).toBeFalsy();

  const graphSynchronizer = new GraphSynchronizer({ globalPropertyNameTransformations: { tryStandardPostfix: '$' } });
  graphSynchronizer.synchronize({ rootDomainObject: authorDomainModel, rootsourceObject: mockWatchedQueryResult.author });

  expect(authorDomainModel.id).not.toBeFalsy();
  expect(authorDomainModel.name$).not.toBeFalsy();
  expect(authorDomainModel.books.size$).not.toBeFalsy();

  expect(authorDomainModel.id).toEqual(mockWatchedQueryResult.author.id);
  expect(authorDomainModel.age$).toEqual(mockWatchedQueryResult.author.age);
  expect(authorDomainModel.books.size$).toEqual(2);

  expect(authorDomainModel.books.array$[0].id).toEqual(mockWatchedQueryResult.author.books[0].id);
  expect(authorDomainModel.books.array$[0].title$).toEqual(mockWatchedQueryResult.author.books[0].title);
  expect(authorDomainModel.books.array$[0].publisher).toBeDefined();
  expect(authorDomainModel.books.array$[0].publisher.id).toEqual(mockWatchedQueryResult.author.books[0].publisher.id);
  expect(authorDomainModel.books.array$[0].publisher.name$).toEqual(mockWatchedQueryResult.author.books[0].publisher.name);
});

//
//
//
test.only('performance', () => {
  // Setup
  const iterations = 10000;
  const authorDomainModel = new AuthorDomainModel();
  const graphSynchronizer = new GraphSynchronizer({ globalPropertyNameTransformations: { tryStandardPostfix: '$' } });

  const startTime = performance.now();

  // Execute
  for (let i = 0; i < iterations; i++) {
    graphSynchronizer.synchronize({ rootDomainObject: authorDomainModel, rootsourceObject: mockWatchedQueryResult.author });
  }

  // Assess
  const finishTime = performance.now();
  const totalTimeMs = Math.round(finishTime - startTime);

  logger.info(`${iterations} graphSynchronizer.synchronize iterations: totalTime: ${totalTimeMs} ms (${totalTimeMs / 1000}s) = per iteration ${totalTimeMs / iterations}ms (${totalTimeMs / iterations / 1000}) `);
});
