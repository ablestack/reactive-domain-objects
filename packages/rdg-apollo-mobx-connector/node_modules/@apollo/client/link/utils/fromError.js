import Observable from 'zen-observable';
import 'symbol-observable';

function fromError(errorValue) {
    return new Observable(function (observer) {
        observer.error(errorValue);
    });
}

export { fromError };
//# sourceMappingURL=fromError.js.map
