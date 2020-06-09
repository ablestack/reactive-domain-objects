import { IExecutableSchemaDefinition } from './types';
export declare function makeExecutableSchema<TContext = any>({ typeDefs, resolvers, logger, allowUndefinedInResolve, resolverValidationOptions, directiveResolvers, schemaDirectives, schemaTransforms, parseOptions, inheritResolversFromInterfaces, }: IExecutableSchemaDefinition<TContext>): import("graphql").GraphQLSchema;
