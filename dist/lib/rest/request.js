"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const url_1 = require("url");
const httpConstants_1 = __importDefault(require("./httpConstants"));
const helpers_1 = require("../helpers");
class Request extends http_1.IncomingMessage {
    constructor(socket) {
        super(socket);
        this.body = { raw: '', parsed: {} };
        this.error = { code: 0, message: '' };
        this.method = 'GET';
        this.queryParameters = {};
        this.settings = { name: '', section: '', raw: false };
        this.url = '';
        this._static = this.constructor;
        this.id = this._generateId();
        this.on('data', this._eventHandlerData.bind(this));
        this.on('end', this._eventHandlerEndValidator.bind(this));
        this.on('end', this._eventHandlerEndEmitter.bind(this));
    }
    /**
     * Processor for the data event emitted by IncomingMessage
     *
     * @param     { Buffer | string }   dataChunk   Data coming in from client.
     * @returns   { void }
     */
    _eventHandlerData(dataChunk) {
        dataChunk = dataChunk.toString();
        if (this._static.MAX_BODY_SIZE < (this.body.raw.length + dataChunk.length)) {
            this.body.raw = '';
            this.removeAllListeners('data');
            this.error.code = httpConstants_1.default.STATUS.PAYLOAD_TOO_LARGE;
            this.error.message = this._static.ERROR_OVER_LIMIT_BODY_LENGTH();
            return;
        }
        this.body.raw += dataChunk;
    }
    /**
     * Log request and emit proper event.
     *
     * @returns { void }
     */
    _eventHandlerEndEmitter() {
        this._static.logger.log({
            group: 'rest-request-received',
            extraData: Object.assign(Object.assign({ requestId: this.id }, this.getClientInformation()), { error: this.error })
        });
        if (this.isErrored()) {
            this.emit('error', this.error);
            return;
        }
        this.emit('ready');
    }
    /**
     * Validate request data before marking request as ready
     *
     * @returns   { void }
     */
    _eventHandlerEndValidator() {
        var _b, _c;
        if (this.isErrored()) {
            return;
        }
        /** Query Params */
        const localUrl = new url_1.URL(this.url, 'http://www.example.com');
        localUrl.searchParams.forEach((value, key) => {
            this.queryParameters[key] = value;
        });
        /** Settings name parsing */
        const urlParts = localUrl.pathname
            .split(encodeURI(this._static.SECTION_SEPARATOR))
            .map(value => value.replace('/', ''));
        this.settings.name = urlParts[0] || '';
        this.settings.section = urlParts[1] || '';
        this.settings.raw = undefined !== this.queryParameters.raw;
        /** content-type */
        (_b = this.headers)['content-type'] || (_b['content-type'] = '');
        if (null === this.headers['content-type'].match(httpConstants_1.default.CONTENT_TYPE.JSON) && '' !== this.body.raw) {
            this.error.code = httpConstants_1.default.STATUS.UNSUPPORTED_MEDIA_TYPE;
            this.error.message = this._static.ERROR_INVALID_CONTENT_TYPE(this.headers['content-type']);
            return;
        }
        /** accept */
        (_c = this.headers).accept || (_c.accept = httpConstants_1.default.CONTENT_TYPE.ALL);
        const suppliedAcceptTypes = this.headers.accept.split(',')
            .map((acceptType) => acceptType.replace(/;.*/, '')) // Remove parameters
            .filter((acceptType) => this._static.VALID_ACCEPT_TYPES.includes(acceptType)); // Filter out non-valid types
        if (0 === suppliedAcceptTypes.length) {
            this.error.code = httpConstants_1.default.STATUS.NOT_ACCEPTABLE;
            this.error.message = this._static.ERROR_INVALID_ACCEPT_TYPE(this.headers.accept);
            return;
        }
        /** Body Parsing */
        if (0 !== this.body.raw.length) {
            try {
                this.body.parsed = JSON.parse(this.body.raw);
                if (!(0, helpers_1.isObject)(this.body.parsed)) {
                    throw '';
                }
            }
            catch (_d) {
                this.error.code = httpConstants_1.default.STATUS.BAD_REQUEST;
                this.error.message = this._static.ERROR_INVALID_CONTENT_SYNTAX();
                this.body.parsed = {};
                this.body.raw = '';
                return;
            }
        }
    }
    /**
     * Generate a unique ID for the request. This generates ~500 ids a millisecond
     * with no collisions in 1 million generated on my laptop. There is probably
     * a better way to go about this, but this works for now.
     *
     * IDs are 15 characters long
     *
     * @returns { string }
     */
    _generateId() {
        const now = Date.now().toString(36);
        const appendage = Math.random().toString(36).substring(2, 8);
        return `${now}.${appendage}`;
    }
    getClientInformation() {
        return {
            headers: this.headers,
            ip: this.headers['x-forwarded-for'] || this.socket.remoteAddress.toString(),
            method: this.method,
            url: this.url,
            userAgent: this.headers['user-agent']
        };
    }
    /**
     * Check if the request has an error
     *
     * @returns { boolean }
     */
    isErrored() { return this.error.code !== 0; }
}
_a = Request;
Request.ERROR_INVALID_ACCEPT_TYPE = (contentType) => `Request accept type is invalid. This server only produces '${httpConstants_1.default.CONTENT_TYPE.JSON}'. '${contentType}' requested.`;
Request.ERROR_INVALID_CONTENT_SYNTAX = () => 'Request body is not valid JSON.';
Request.ERROR_INVALID_CONTENT_TYPE = (contentType) => `Request content type is invalid. This server only processes ${httpConstants_1.default.CONTENT_TYPE.JSON}. '${contentType}' supplied.`;
Request.ERROR_OVER_LIMIT_BODY_LENGTH = () => `Request body is larger than the ${_a.MAX_BODY_SIZE} byte limit.`;
Request.VALID_ACCEPT_TYPES = [httpConstants_1.default.CONTENT_TYPE.ALL, httpConstants_1.default.CONTENT_TYPE.JSON];
Request.MAX_BODY_SIZE = 0;
Request.SECTION_SEPARATOR = '';
exports.default = Request;
