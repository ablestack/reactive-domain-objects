import { DocumentNode } from 'graphql';
import { QueryHookOptions, QueryResult } from '../types/types';
import { OperationVariables } from '../../core/types';
export declare function useQuery<TData = any, TVariables = OperationVariables>(query: DocumentNode, options?: QueryHookOptions<TData, TVariables>): QueryResult<TData, TVariables>;
//# sourceMappingURL=useQuery.d.ts.map