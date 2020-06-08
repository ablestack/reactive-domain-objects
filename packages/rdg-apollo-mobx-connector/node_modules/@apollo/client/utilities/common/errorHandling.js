function tryFunctionOrLogError(f) {
    try {
        return f();
    }
    catch (e) {
        if (console.error) {
            console.error(e);
        }
    }
}
function graphQLResultHasError(result) {
    return (result.errors && result.errors.length > 0) || false;
}

export { graphQLResultHasError, tryFunctionOrLogError };
//# sourceMappingURL=errorHandling.js.map
