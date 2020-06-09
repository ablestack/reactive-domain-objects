import { defaultFieldResolver, isScalarType, getNamedType, Kind, print, buildASTSchema, extendSchema, parse, isAbstractType, isSchema, isSpecifiedScalarType, isEnumType, GraphQLEnumType, isUnionType, isObjectType, isInterfaceType, GraphQLScalarType, GraphQLUnionType, GraphQLObjectType, GraphQLInterfaceType } from 'graphql';
import { mapSchema, MapperKind, forEachField, getDirectives, forEachDefaultValue, serializeInputValue, healSchema, parseInputValue, mergeDeep, SchemaDirectiveVisitor } from '@graphql-tools/utils';

// wraps all resolvers of query, mutation or subscription fields
// with the provided function to simulate a root schema level resolver
function addSchemaLevelResolver(schema, fn) {
    // TODO test that schema is a schema, fn is a function
    const fnToRunOnlyOnce = runAtMostOncePerRequest(fn);
    return mapSchema(schema, {
        [MapperKind.ROOT_FIELD]: (fieldConfig, _fieldName, typeName, schema) => {
            // XXX this should run at most once per request to simulate a true root resolver
            // for graphql-js this is an approximation that works with queries but not mutations
            // XXX if the type is a subscription, a same query AST will be ran multiple times so we
            // deactivate here the runOnce if it's a subscription. This may not be optimal though...
            const subscription = schema.getSubscriptionType();
            if (subscription != null && subscription.name === typeName) {
                return {
                    ...fieldConfig,
                    resolve: wrapResolver(fieldConfig.resolve, fn),
                };
            }
            return {
                ...fieldConfig,
                resolve: wrapResolver(fieldConfig.resolve, fnToRunOnlyOnce),
            };
        },
    });
}
// XXX badly named function. this doesn't really wrap, it just chains resolvers...
function wrapResolver(innerResolver, outerResolver) {
    return (obj, args, ctx, info) => resolveMaybePromise(outerResolver(obj, args, ctx, info), root => {
        if (innerResolver != null) {
            return innerResolver(root, args, ctx, info);
        }
        return defaultFieldResolver(root, args, ctx, info);
    });
}
function isPromise(maybePromise) {
    return maybePromise && typeof maybePromise.then === 'function';
}
// resolvers can be synchronous or asynchronous. if all resolvers
// in an operation return synchronously, the execution should return
// synchronously. the maybe-sync/maybe-async nature of resolvers should be
// preserved
function resolveMaybePromise(maybePromise, fulfillmentCallback) {
    if (isPromise(maybePromise)) {
        return maybePromise.then(fulfillmentCallback);
    }
    return fulfillmentCallback(maybePromise);
}
// XXX this function only works for resolvers
// XXX very hacky way to remember if the function
// already ran for this request. This will only work
// if people don't actually cache the operation.
// if they do cache the operation, they will have to
// manually remove the __runAtMostOnce before every request.
function runAtMostOncePerRequest(fn) {
    let value;
    const randomNumber = Math.random();
    return (root, args, ctx, info) => {
        if (!info.operation['__runAtMostOnce']) {
            info.operation['__runAtMostOnce'] = {};
        }
        if (!info.operation['__runAtMostOnce'][randomNumber]) {
            info.operation['__runAtMostOnce'][randomNumber] = true;
            value = fn(root, args, ctx, info);
        }
        return value;
    };
}

function assertResolversPresent(schema, resolverValidationOptions = {}) {
    const { requireResolversForArgs = false, requireResolversForNonScalar = false, requireResolversForAllFields = false, } = resolverValidationOptions;
    if (requireResolversForAllFields && (requireResolversForArgs || requireResolversForNonScalar)) {
        throw new TypeError('requireResolversForAllFields takes precedence over the more specific assertions. ' +
            'Please configure either requireResolversForAllFields or requireResolversForArgs / ' +
            'requireResolversForNonScalar, but not a combination of them.');
    }
    forEachField(schema, (field, typeName, fieldName) => {
        // requires a resolver for *every* field.
        if (requireResolversForAllFields) {
            expectResolver(field, typeName, fieldName);
        }
        // requires a resolver on every field that has arguments
        if (requireResolversForArgs && field.args.length > 0) {
            expectResolver(field, typeName, fieldName);
        }
        // requires a resolver on every field that returns a non-scalar type
        if (requireResolversForNonScalar && !isScalarType(getNamedType(field.type))) {
            expectResolver(field, typeName, fieldName);
        }
    });
}
function expectResolver(field, typeName, fieldName) {
    if (!field.resolve) {
        // eslint-disable-next-line no-console
        console.warn(`Resolver missing for "${typeName}.${fieldName}".
To disable this warning check pass;
resolverValidationOptions: {
  requireResolversForNonScalar: false
}
      `);
        return;
    }
    if (typeof field.resolve !== 'function') {
        throw new Error(`Resolver "${typeName}.${fieldName}" must be a function`);
    }
}

function attachDirectiveResolvers(schema, directiveResolvers) {
    if (typeof directiveResolvers !== 'object') {
        throw new Error(`Expected directiveResolvers to be of type object, got ${typeof directiveResolvers}`);
    }
    if (Array.isArray(directiveResolvers)) {
        throw new Error('Expected directiveResolvers to be of type object, got Array');
    }
    return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: fieldConfig => {
            const newFieldConfig = { ...fieldConfig };
            const directives = getDirectives(schema, fieldConfig);
            Object.keys(directives).forEach(directiveName => {
                if (directiveResolvers[directiveName]) {
                    const resolver = directiveResolvers[directiveName];
                    const originalResolver = newFieldConfig.resolve != null ? newFieldConfig.resolve : defaultFieldResolver;
                    const directiveArgs = directives[directiveName];
                    newFieldConfig.resolve = (source, originalArgs, context, info) => {
                        return resolver(() => new Promise((resolve, reject) => {
                            const result = originalResolver(source, originalArgs, context, info);
                            if (result instanceof Error) {
                                reject(result);
                            }
                            resolve(result);
                        }), source, directiveArgs, context, info);
                    };
                }
            });
            return newFieldConfig;
        },
    });
}

function extractExtensionDefinitions(ast) {
    const extensionDefs = ast.definitions.filter((def) => def.kind === Kind.OBJECT_TYPE_EXTENSION ||
        def.kind === Kind.INTERFACE_TYPE_EXTENSION ||
        def.kind === Kind.INPUT_OBJECT_TYPE_EXTENSION ||
        def.kind === Kind.UNION_TYPE_EXTENSION ||
        def.kind === Kind.ENUM_TYPE_EXTENSION ||
        def.kind === Kind.SCALAR_TYPE_EXTENSION ||
        def.kind === Kind.SCHEMA_EXTENSION);
    return {
        ...ast,
        definitions: extensionDefs,
    };
}
function filterExtensionDefinitions(ast) {
    const extensionDefs = ast.definitions.filter((def) => def.kind !== Kind.OBJECT_TYPE_EXTENSION &&
        def.kind !== Kind.INTERFACE_TYPE_EXTENSION &&
        def.kind !== Kind.INPUT_OBJECT_TYPE_EXTENSION &&
        def.kind !== Kind.UNION_TYPE_EXTENSION &&
        def.kind !== Kind.ENUM_TYPE_EXTENSION &&
        def.kind !== Kind.SCALAR_TYPE_EXTENSION &&
        def.kind !== Kind.SCHEMA_EXTENSION);
    return {
        ...ast,
        definitions: extensionDefs,
    };
}

function concatenateTypeDefs(typeDefinitionsAry, calledFunctionRefs = []) {
    let resolvedTypeDefinitions = [];
    typeDefinitionsAry.forEach((typeDef) => {
        if (typeof typeDef === 'function') {
            if (calledFunctionRefs.indexOf(typeDef) === -1) {
                calledFunctionRefs.push(typeDef);
                resolvedTypeDefinitions = resolvedTypeDefinitions.concat(concatenateTypeDefs(typeDef(), calledFunctionRefs));
            }
        }
        else if (typeof typeDef === 'string') {
            resolvedTypeDefinitions.push(typeDef.trim());
        }
        else if (typeDef.kind !== undefined) {
            resolvedTypeDefinitions.push(print(typeDef).trim());
        }
        else {
            const type = typeof typeDef;
            throw new Error(`typeDef array must contain only strings, documents, or functions, got ${type}`);
        }
    });
    return uniq(resolvedTypeDefinitions.map(x => x.trim())).join('\n');
}
function uniq(array) {
    return array.reduce((accumulator, currentValue) => accumulator.indexOf(currentValue) === -1 ? [...accumulator, currentValue] : accumulator, []);
}

function buildSchemaFromTypeDefinitions(typeDefinitions, parseOptions) {
    const document = buildDocumentFromTypeDefinitions(typeDefinitions, parseOptions);
    const typesAst = filterExtensionDefinitions(document);
    const backcompatOptions = { commentDescriptions: true };
    let schema = buildASTSchema(typesAst, backcompatOptions);
    const extensionsAst = extractExtensionDefinitions(document);
    if (extensionsAst.definitions.length > 0) {
        schema = extendSchema(schema, extensionsAst, backcompatOptions);
    }
    return schema;
}
function isDocumentNode(typeDefinitions) {
    return typeDefinitions.kind !== undefined;
}
function buildDocumentFromTypeDefinitions(typeDefinitions, parseOptions) {
    let document;
    if (typeof typeDefinitions === 'string') {
        document = parse(typeDefinitions, parseOptions);
    }
    else if (Array.isArray(typeDefinitions)) {
        document = parse(concatenateTypeDefs(typeDefinitions), parseOptions);
    }
    else if (isDocumentNode(typeDefinitions)) {
        document = typeDefinitions;
    }
    else {
        const type = typeof typeDefinitions;
        throw new Error(`typeDefs must be a string, array or schema AST, got ${type}`);
    }
    return document;
}

function chainResolvers(resolvers) {
    return (root, args, ctx, info) => resolvers.reduce((prev, curResolver) => {
        if (curResolver != null) {
            return curResolver(prev, args, ctx, info);
        }
        return defaultFieldResolver(prev, args, ctx, info);
    }, root);
}

/*
 * fn: The function to decorate with the logger
 * logger: an object instance of type Logger
 * hint: an optional hint to add to the error's message
 */
function decorateWithLogger(fn, logger, hint) {
    const resolver = fn != null ? fn : defaultFieldResolver;
    const logError = (e) => {
        // TODO: clone the error properly
        const newE = new Error();
        newE.stack = e.stack;
        /* istanbul ignore else: always get the hint from addErrorLoggingToSchema */
        if (hint) {
            newE['originalMessage'] = e.message;
            newE.message = `Error in resolver ${hint}\n${e.message}`;
        }
        logger.log(newE);
    };
    return (root, args, ctx, info) => {
        try {
            const result = resolver(root, args, ctx, info);
            // If the resolver returns a Promise log any Promise rejects.
            if (result && typeof result.then === 'function' && typeof result.catch === 'function') {
                result.catch((reason) => {
                    // make sure that it's an error we're logging.
                    const error = reason instanceof Error ? reason : new Error(reason);
                    logError(error);
                    // We don't want to leave an unhandled exception so pass on error.
                    return reason;
                });
            }
            return result;
        }
        catch (e) {
            logError(e);
            // we want to pass on the error, just in case.
            throw e;
        }
    };
}

// If we have any union or interface types throw if no there is no resolveType or isTypeOf resolvers
function checkForResolveTypeResolver(schema, requireResolversForResolveType) {
    Object.keys(schema.getTypeMap())
        .map(typeName => schema.getType(typeName))
        .forEach((type) => {
        if (!isAbstractType(type)) {
            return;
        }
        if (!type.resolveType) {
            if (!requireResolversForResolveType) {
                return;
            }
            throw new Error(`Type "${type.name}" is missing a "__resolveType" resolver. Pass false into ` +
                '"resolverValidationOptions.requireResolversForResolveType" to disable this error.');
        }
    });
}

function extendResolversFromInterfaces(schema, resolvers) {
    const typeNames = Object.keys({
        ...schema.getTypeMap(),
        ...resolvers,
    });
    const extendedResolvers = {};
    typeNames.forEach(typeName => {
        const type = schema.getType(typeName);
        if ('getInterfaces' in type) {
            const allInterfaceResolvers = type
                .getInterfaces()
                .map(iFace => resolvers[iFace.name])
                .filter(interfaceResolvers => interfaceResolvers != null);
            extendedResolvers[typeName] = {};
            allInterfaceResolvers.forEach(interfaceResolvers => {
                Object.keys(interfaceResolvers).forEach(fieldName => {
                    if (fieldName === '__isTypeOf' || !fieldName.startsWith('__')) {
                        extendedResolvers[typeName][fieldName] = interfaceResolvers[fieldName];
                    }
                });
            });
            const typeResolvers = resolvers[typeName];
            extendedResolvers[typeName] = {
                ...extendedResolvers[typeName],
                ...typeResolvers,
            };
        }
        else {
            const typeResolvers = resolvers[typeName];
            if (typeResolvers != null) {
                extendedResolvers[typeName] = typeResolvers;
            }
        }
    });
    return extendedResolvers;
}

function addResolversToSchema(schemaOrOptions, legacyInputResolvers, legacyInputValidationOptions) {
    const options = isSchema(schemaOrOptions)
        ? {
            schema: schemaOrOptions,
            resolvers: legacyInputResolvers,
            resolverValidationOptions: legacyInputValidationOptions,
        }
        : schemaOrOptions;
    let { schema, resolvers: inputResolvers, defaultFieldResolver, resolverValidationOptions = {}, inheritResolversFromInterfaces = false, updateResolversInPlace = false, } = options;
    const { allowResolversNotInSchema = false, requireResolversForResolveType } = resolverValidationOptions;
    const resolvers = inheritResolversFromInterfaces
        ? extendResolversFromInterfaces(schema, inputResolvers)
        : inputResolvers;
    Object.keys(resolvers).forEach(typeName => {
        const resolverValue = resolvers[typeName];
        const resolverType = typeof resolverValue;
        if (typeName === '__schema') {
            if (resolverType !== 'function') {
                throw new Error(`"${typeName}" defined in resolvers, but has invalid value "${resolverValue}". A schema resolver's value must be of type object or function.`);
            }
        }
        else {
            if (resolverType !== 'object') {
                throw new Error(`"${typeName}" defined in resolvers, but has invalid value "${resolverValue}". The resolver's value must be of type object.`);
            }
            const type = schema.getType(typeName);
            if (type == null) {
                if (allowResolversNotInSchema) {
                    return;
                }
                throw new Error(`"${typeName}" defined in resolvers, but not in schema`);
            }
            else if (isSpecifiedScalarType(type)) {
                // allow -- without recommending -- overriding of specified scalar types
                Object.keys(resolverValue).forEach(fieldName => {
                    if (fieldName.startsWith('__')) {
                        type[fieldName.substring(2)] = resolverValue[fieldName];
                    }
                    else {
                        type[fieldName] = resolverValue[fieldName];
                    }
                });
            }
        }
    });
    schema = updateResolversInPlace
        ? addResolversToExistingSchema({
            schema,
            resolvers,
            defaultFieldResolver,
            allowResolversNotInSchema,
        })
        : createNewSchemaWithResolvers({
            schema,
            resolvers,
            defaultFieldResolver,
            allowResolversNotInSchema,
        });
    checkForResolveTypeResolver(schema, requireResolversForResolveType);
    return schema;
}
function addResolversToExistingSchema({ schema, resolvers, defaultFieldResolver, allowResolversNotInSchema, }) {
    const typeMap = schema.getTypeMap();
    Object.keys(resolvers).forEach(typeName => {
        if (typeName !== '__schema') {
            const type = schema.getType(typeName);
            const resolverValue = resolvers[typeName];
            if (isScalarType(type)) {
                Object.keys(resolverValue).forEach(fieldName => {
                    if (fieldName.startsWith('__')) {
                        type[fieldName.substring(2)] = resolverValue[fieldName];
                    }
                    else {
                        type[fieldName] = resolverValue[fieldName];
                    }
                });
            }
            else if (isEnumType(type)) {
                const config = type.toConfig();
                const enumValueConfigMap = config.values;
                Object.keys(resolverValue).forEach(fieldName => {
                    if (fieldName.startsWith('__')) {
                        config[fieldName.substring(2)] = resolverValue[fieldName];
                    }
                    else if (!enumValueConfigMap[fieldName]) {
                        if (allowResolversNotInSchema) {
                            return;
                        }
                        throw new Error(`${type.name}.${fieldName} was defined in resolvers, but not present within ${type.name}`);
                    }
                    else {
                        enumValueConfigMap[fieldName].value = resolverValue[fieldName];
                    }
                });
                typeMap[typeName] = new GraphQLEnumType(config);
            }
            else if (isUnionType(type)) {
                Object.keys(resolverValue).forEach(fieldName => {
                    if (fieldName.startsWith('__')) {
                        type[fieldName.substring(2)] = resolverValue[fieldName];
                        return;
                    }
                    if (allowResolversNotInSchema) {
                        return;
                    }
                    throw new Error(`${type.name}.${fieldName} was defined in resolvers, but ${type.name} is not an object or interface type`);
                });
            }
            else if (isObjectType(type) || isInterfaceType(type)) {
                Object.keys(resolverValue).forEach(fieldName => {
                    if (fieldName.startsWith('__')) {
                        // this is for isTypeOf and resolveType and all the other stuff.
                        type[fieldName.substring(2)] = resolverValue[fieldName];
                        return;
                    }
                    const fields = type.getFields();
                    const field = fields[fieldName];
                    if (field == null) {
                        if (allowResolversNotInSchema) {
                            return;
                        }
                        throw new Error(`${typeName}.${fieldName} defined in resolvers, but not in schema`);
                    }
                    const fieldResolve = resolverValue[fieldName];
                    if (typeof fieldResolve === 'function') {
                        // for convenience. Allows shorter syntax in resolver definition file
                        field.resolve = fieldResolve;
                    }
                    else {
                        if (typeof fieldResolve !== 'object') {
                            throw new Error(`Resolver ${typeName}.${fieldName} must be object or function`);
                        }
                        setFieldProperties(field, fieldResolve);
                    }
                });
            }
        }
    });
    // serialize all default values prior to healing fields with new scalar/enum types.
    forEachDefaultValue(schema, serializeInputValue);
    // schema may have new scalar/enum types that require healing
    healSchema(schema);
    // reparse all default values with new parsing functions.
    forEachDefaultValue(schema, parseInputValue);
    if (defaultFieldResolver != null) {
        forEachField(schema, field => {
            if (!field.resolve) {
                field.resolve = defaultFieldResolver;
            }
        });
    }
    return schema;
}
function createNewSchemaWithResolvers({ schema, resolvers, defaultFieldResolver, allowResolversNotInSchema, }) {
    schema = mapSchema(schema, {
        [MapperKind.SCALAR_TYPE]: type => {
            const config = type.toConfig();
            const resolverValue = resolvers[type.name];
            if (!isSpecifiedScalarType(type) && resolverValue != null) {
                Object.keys(resolverValue).forEach(fieldName => {
                    if (fieldName.startsWith('__')) {
                        config[fieldName.substring(2)] = resolverValue[fieldName];
                    }
                    else {
                        config[fieldName] = resolverValue[fieldName];
                    }
                });
                return new GraphQLScalarType(config);
            }
        },
        [MapperKind.ENUM_TYPE]: type => {
            const resolverValue = resolvers[type.name];
            const config = type.toConfig();
            const enumValueConfigMap = config.values;
            if (resolverValue != null) {
                Object.keys(resolverValue).forEach(fieldName => {
                    if (fieldName.startsWith('__')) {
                        config[fieldName.substring(2)] = resolverValue[fieldName];
                    }
                    else if (!enumValueConfigMap[fieldName]) {
                        if (allowResolversNotInSchema) {
                            return;
                        }
                        throw new Error(`${type.name}.${fieldName} was defined in resolvers, but not present within ${type.name}`);
                    }
                    else {
                        enumValueConfigMap[fieldName].value = resolverValue[fieldName];
                    }
                });
                return new GraphQLEnumType(config);
            }
        },
        [MapperKind.UNION_TYPE]: type => {
            const resolverValue = resolvers[type.name];
            if (resolverValue != null) {
                const config = type.toConfig();
                Object.keys(resolverValue).forEach(fieldName => {
                    if (fieldName.startsWith('__')) {
                        // this is for isTypeOf and resolveType and all the other stuff.
                        config[fieldName.substring(2)] = resolverValue[fieldName];
                        return;
                    }
                    if (allowResolversNotInSchema) {
                        return;
                    }
                    throw new Error(`${type.name}.${fieldName} was defined in resolvers, but ${type.name} is not an object or interface type`);
                });
                return new GraphQLUnionType(config);
            }
        },
        [MapperKind.OBJECT_TYPE]: type => {
            const resolverValue = resolvers[type.name];
            if (resolverValue != null) {
                const config = type.toConfig();
                const fields = config.fields;
                Object.keys(resolverValue).forEach(fieldName => {
                    if (fieldName.startsWith('__')) {
                        config[fieldName.substring(2)] = resolverValue[fieldName];
                        return;
                    }
                    const field = fields[fieldName];
                    if (field == null) {
                        if (allowResolversNotInSchema) {
                            return;
                        }
                        throw new Error(`${type.name}.${fieldName} defined in resolvers, but not in schema`);
                    }
                });
                return new GraphQLObjectType(config);
            }
        },
        [MapperKind.INTERFACE_TYPE]: type => {
            const resolverValue = resolvers[type.name];
            if (resolverValue != null) {
                const config = type.toConfig();
                const fields = config.fields;
                Object.keys(resolverValue).forEach(fieldName => {
                    if (fieldName.startsWith('__')) {
                        config[fieldName.substring(2)] = resolverValue[fieldName];
                        return;
                    }
                    const field = fields[fieldName];
                    if (field == null) {
                        if (allowResolversNotInSchema) {
                            return;
                        }
                        throw new Error(`${type.name}.${fieldName} defined in resolvers, but not in schema`);
                    }
                });
                return new GraphQLInterfaceType(config);
            }
        },
        [MapperKind.COMPOSITE_FIELD]: (fieldConfig, fieldName, typeName) => {
            const resolverValue = resolvers[typeName];
            if (resolverValue != null) {
                const fieldResolve = resolverValue[fieldName];
                if (fieldResolve != null) {
                    const newFieldConfig = { ...fieldConfig };
                    if (typeof fieldResolve === 'function') {
                        // for convenience. Allows shorter syntax in resolver definition file
                        newFieldConfig.resolve = fieldResolve;
                    }
                    else {
                        if (typeof fieldResolve !== 'object') {
                            throw new Error(`Resolver ${typeName}.${fieldName} must be object or function`);
                        }
                        setFieldProperties(newFieldConfig, fieldResolve);
                    }
                    return newFieldConfig;
                }
            }
        },
    });
    if (defaultFieldResolver != null) {
        schema = mapSchema(schema, {
            [MapperKind.OBJECT_FIELD]: fieldConfig => ({
                ...fieldConfig,
                resolve: fieldConfig.resolve != null ? fieldConfig.resolve : defaultFieldResolver,
            }),
        });
    }
    return schema;
}
function setFieldProperties(field, propertiesObj) {
    Object.keys(propertiesObj).forEach(propertyName => {
        field[propertyName] = propertiesObj[propertyName];
    });
}

function addErrorLoggingToSchema(schema, logger) {
    if (!logger) {
        throw new Error('Must provide a logger');
    }
    if (typeof logger.log !== 'function') {
        throw new Error('Logger.log must be a function');
    }
    return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig, fieldName, typeName) => ({
            ...fieldConfig,
            resolve: decorateWithLogger(fieldConfig.resolve, logger, `${typeName}.${fieldName}`),
        }),
    });
}

function decorateToCatchUndefined(fn, hint) {
    const resolve = fn == null ? defaultFieldResolver : fn;
    return (root, args, ctx, info) => {
        const result = resolve(root, args, ctx, info);
        if (typeof result === 'undefined') {
            throw new Error(`Resolver for "${hint}" returned undefined`);
        }
        return result;
    };
}
function addCatchUndefinedToSchema(schema) {
    return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig, fieldName, typeName) => ({
            ...fieldConfig,
            resolve: decorateToCatchUndefined(fieldConfig.resolve, `${typeName}.${fieldName}`),
        }),
    });
}

function makeExecutableSchema({ typeDefs, resolvers = {}, logger, allowUndefinedInResolve = true, resolverValidationOptions = {}, directiveResolvers, schemaDirectives, schemaTransforms = [], parseOptions = {}, inheritResolversFromInterfaces = false, }) {
    // Validate and clean up arguments
    if (typeof resolverValidationOptions !== 'object') {
        throw new Error('Expected `resolverValidationOptions` to be an object');
    }
    if (!typeDefs) {
        throw new Error('Must provide typeDefs');
    }
    // We allow passing in an array of resolver maps, in which case we merge them
    const resolverMap = Array.isArray(resolvers) ? resolvers.reduce(mergeDeep, {}) : resolvers;
    // Arguments are now validated and cleaned up
    let schema = buildSchemaFromTypeDefinitions(typeDefs, parseOptions);
    schema = addResolversToSchema({
        schema,
        resolvers: resolverMap,
        resolverValidationOptions,
        inheritResolversFromInterfaces,
    });
    assertResolversPresent(schema, resolverValidationOptions);
    if (!allowUndefinedInResolve) {
        schema = addCatchUndefinedToSchema(schema);
    }
    if (logger != null) {
        schema = addErrorLoggingToSchema(schema, logger);
    }
    if (typeof resolvers['__schema'] === 'function') {
        // TODO a bit of a hack now, better rewrite generateSchema to attach it there.
        // not doing that now, because I'd have to rewrite a lot of tests.
        schema = addSchemaLevelResolver(schema, resolvers['__schema']);
    }
    schemaTransforms.forEach(schemaTransform => {
        schema = schemaTransform(schema);
    });
    // directive resolvers are implemented using SchemaDirectiveVisitor.visitSchemaDirectives
    // schema visiting modifies the schema in place
    if (directiveResolvers != null) {
        schema = attachDirectiveResolvers(schema, directiveResolvers);
    }
    if (schemaDirectives != null) {
        SchemaDirectiveVisitor.visitSchemaDirectives(schema, schemaDirectives);
    }
    return schema;
}

export { addCatchUndefinedToSchema, addErrorLoggingToSchema, addResolversToSchema, addSchemaLevelResolver, assertResolversPresent, attachDirectiveResolvers, buildDocumentFromTypeDefinitions, buildSchemaFromTypeDefinitions, chainResolvers, checkForResolveTypeResolver, concatenateTypeDefs, decorateWithLogger, extendResolversFromInterfaces, extractExtensionDefinitions, filterExtensionDefinitions, makeExecutableSchema };
//# sourceMappingURL=index.esm.js.map
