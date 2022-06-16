"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HTTPConstants = {
    CONTENT_TYPE: {
        ALL: '*/*',
        JSON: 'application/json'
    },
    METHOD: {
        DELETE: 'DELETE',
        GET: 'GET',
        PATCH: 'PATCH',
        POST: 'POST',
        PUT: 'PUT'
    },
    STATUS: {
        OKAY: 200,
        NO_CONTENT: 204,
        BAD_REQUEST: 400,
        NOT_FOUND: 404,
        NOT_ACCEPTABLE: 406,
        CONFLICT: 409,
        UNSUPPORTED_MEDIA_TYPE: 415,
        PAYLOAD_TOO_LARGE: 419,
        INTERNAL_SERVER_ERROR: 500
    }
};
exports.default = HTTPConstants;
