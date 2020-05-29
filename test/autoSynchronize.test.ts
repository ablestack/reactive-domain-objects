import { observable } from 'mobx';
import { SyncableCollection, GraphSynchronizer } from '../src';
import { Logger } from '../src/logger';
import { AuthorDM, mockWatchedQueryResult } from '.';

const logger = Logger.make('autoSynchronize.test.ts');

// --------------------------------------------------------------
// TESTS
// --------------------------------------------------------------

test('auto synchronize updates properties as expected', () => {
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

//
//
//
test.only('performance', () => {
  // Setup
  const iterations = 10000;
  const authorDM = new AuthorDM();
  const graphSynchronizer = new GraphSynchronizer({ globalPropertyNameTransformations: { tryStandardPostfix: '$' } });

  const startTime = performance.now();

  // Execute
  for (let i = 0; i < iterations; i++) {
    graphSynchronizer.synchronize({ rootDomainObject: authorDM, rootsourceObject: mockWatchedQueryResult.author });
  }

  // Assess
  const finishTime = performance.now();
  const totalTimeMs = Math.round(finishTime - startTime);

  logger.info(`${iterations} graphSynchronizer.synchronize iterations: totalTime: ${totalTimeMs} ms (${totalTimeMs / 1000}s) = per iteration ${totalTimeMs / iterations}ms (${totalTimeMs / iterations / 1000}) `);
});
