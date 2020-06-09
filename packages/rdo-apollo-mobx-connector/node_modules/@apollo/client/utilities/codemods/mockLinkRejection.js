import * as recast from "recast";
var n = recast.types.namedTypes;
var b = recast.types.builders;
export default function (fileInfo, api) {
    var ast = recast.parse(fileInfo.source, {
        parser: require("recast/parsers/typescript"),
    });
    var transformed = recast.visit(ast, {
        visitCallExpression: function (path) {
            this.traverse(path);
            var node = path.node;
            if (n.Identifier.check(node.callee) &&
                node.callee.name === "mockSingleLink") {
                var firstArg = node.arguments[0];
                if ((n.Identifier.check(firstArg) &&
                    firstArg.name === "reject") ||
                    n.Function.check(firstArg)) {
                    path.get("arguments").shift();
                    path.replace(b.callExpression(b.memberExpression(node, b.identifier("setOnError"), false), [firstArg]));
                }
            }
        },
    });
    return recast.print(transformed).code;
}
//# sourceMappingURL=mockLinkRejection.js.map