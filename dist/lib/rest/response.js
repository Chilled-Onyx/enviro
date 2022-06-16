"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const httpConstants_1 = __importDefault(require("./httpConstants"));
class Response extends http_1.ServerResponse {
    constructor(request) {
        super(request);
        this.body = {};
        this.bodyWritten = false;
        this.statusCode = httpConstants_1.default.STATUS.OKAY;
        this._static = this.constructor;
        this.req = request;
        this.setHeader('Content-Type', httpConstants_1.default.CONTENT_TYPE.JSON);
    }
    /**
     * End connection after writing body.
     *
     * @param     { any }                     params  Any properties you would pass to { @see ServerResponse.end }
     * @returns   { Enviro.REST.Response }
     */
    end(cb) {
        this.writeBody();
        this._static.logger.log({
            group: 'rest-response-sent',
            extraData: {
                requestId: this.req.id,
                response: {
                    body: this.body,
                    status: this.statusCode
                },
            }
        });
        return super.end(cb);
    }
    /**
     * Write body to output buffer if it has content.
     * Can only be done if the body hasn't already been written.
     *
     * @returns { Enviro.REST.Response }
     */
    writeBody() {
        if (0 !== Object.keys(this.body).length && !this.bodyWritten) {
            this.bodyWritten = this.write(JSON.stringify(this.body));
        }
        return this;
    }
}
exports.default = Response;
