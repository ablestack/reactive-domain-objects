import React from 'react';
import { ApolloClient } from '../../ApolloClient';
export interface ApolloContextValue {
    client?: ApolloClient<object>;
    renderPromises?: Record<any, any>;
}
export declare function resetApolloContext(): void;
export declare function getApolloContext(): React.Context<ApolloContextValue>;
//# sourceMappingURL=ApolloContext.d.ts.map