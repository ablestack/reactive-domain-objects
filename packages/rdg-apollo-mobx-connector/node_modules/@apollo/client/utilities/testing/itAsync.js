function wrap(original) {
    return function (message, callback, timeout) { return original(message, function () {
        var _this = this;
        return new Promise(function (resolve, reject) { return callback.call(_this, resolve, reject); });
    }, timeout); };
}
var wrappedIt = wrap(it);
export function itAsync() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return wrappedIt.apply(this, args);
}
(function (itAsync) {
    itAsync.only = wrap(it.only);
    itAsync.skip = wrap(it.skip);
    itAsync.todo = wrap(it.todo);
})(itAsync || (itAsync = {}));
//# sourceMappingURL=itAsync.js.map