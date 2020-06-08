"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparers = void 0;
const tslib_1 = require("tslib");
const equality_1 = tslib_1.__importDefault(require("@wry/equality"));
function apolloComparer(a, b) {
    return equality_1.default(a, b);
}
function identityComparer(a, b) {
    return a === b;
}
// function structuralComparer(a: any, b: any): boolean {
//   // Todo
//   // return deepEqual(a, b);
//   return false;
// }
// function shallowComparer(a: any, b: any): boolean {
//   // TODO
//   //return deepEqual(a, b, 1);
//   return false;
// }
function defaultComparer(a, b) {
    return Object.is(a, b);
}
exports.comparers = {
    apollo: apolloComparer,
    identity: identityComparer,
    //structural: structuralComparer,
    default: defaultComparer,
};
//# sourceMappingURL=comparers.js.map