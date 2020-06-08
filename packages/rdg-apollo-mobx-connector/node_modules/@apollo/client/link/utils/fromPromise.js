import Observable from 'zen-observable';
import 'symbol-observable';

function fromPromise(promise) {
    return new Observable(function (observer) {
        promise
            .then(function (value) {
            observer.next(value);
            observer.complete();
        })
            .catch(observer.error.bind(observer));
    });
}

export { fromPromise };
//# sourceMappingURL=fromPromise.js.map
