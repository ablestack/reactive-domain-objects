"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoWrapperValidationUtils = void 0;
const static_config_1 = require("../../static.config");
const logger_1 = require("../../infrastructure/logger");
const logger = logger_1.Logger.make('RdoWrapperValidationUtils');
function nonKeyedCollectionSizeCheck({ sourceNodePath, collectionSize, collectionType }) {
    if (collectionSize > static_config_1.config.non_keyed_collection_warning_size_threashold)
        logger.warn(`Path: '${sourceNodePath}', collection size:${collectionSize}, type: ${collectionType}. It is recommended that Map or Custom collections types are used in the RDOs for large collections. Set and Array collections will perform less well with large collections`);
}
exports.RdoWrapperValidationUtils = { nonKeyedCollectionSizeCheck };
//# sourceMappingURL=rdo-wrapper-validation.utils.js.map