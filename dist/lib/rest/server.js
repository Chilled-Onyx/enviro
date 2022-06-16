"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const https_1 = require("https");
const request_1 = __importDefault(require("./request"));
const response_1 = __importDefault(require("./response"));
const httpConstants_1 = __importDefault(require("./httpConstants"));
const ONE_MEGABYTE = Math.pow(10, 6);
class Server {
    constructor(config, enviro) {
        this.config = this.constructor.buildConfigObject(config);
        this.enviro = enviro;
        request_1.default.MAX_BODY_SIZE = this.config.maxBodySize;
        request_1.default.SECTION_SEPARATOR = this.config.settingsSectionSeparator;
        request_1.default.logger = response_1.default.logger = enviro.logger;
        const serverOptions = {
            IncomingMessage: request_1.default,
            ServerResponse: response_1.default
        };
        let createServer = http_1.createServer;
        if ('' !== this.config.certificate && '' !== this.config.key) {
            serverOptions.cert = this.config.certificate;
            serverOptions.key = this.config.key;
            createServer = https_1.createServer;
        }
        this._server = createServer(serverOptions, this._requestHandler.bind(this));
    }
    _requestHandler(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            request.on('error', () => {
                response.statusCode = request.error.code;
                response.body = { message: request.error.message };
                response.end();
            });
            request.on('ready', () => __awaiter(this, void 0, void 0, function* () {
                if (!(yield this.enviro.pluginManager.route(request, response))) {
                    response.statusCode = httpConstants_1.default.STATUS.NOT_FOUND;
                    response.body = { message: 'Not found.' };
                }
                response.end();
            }));
        });
    }
    /**
     * Build config object
     *
     * @param       { Partial<Enviro.REST.Config> }     config    Partial configuration to be turned into full config object.
     * @returns     { Enviro.REST.Config }
     */
    static buildConfigObject(config) {
        config.certificate || (config.certificate = '');
        config.key || (config.key = '');
        config.maxBodySize || (config.maxBodySize = ONE_MEGABYTE);
        config.port = (config.port || config.port === 0) ? config.port : 80;
        config.settingsSectionSeparator || (config.settingsSectionSeparator = '>');
        return config;
    }
    /**
     * Start the server
     *
     * @returns { Enviro.REST.Server }
     */
    start() {
        if (this._server.listening) {
            return this;
        }
        this._server.listen(this.config.port);
        if (0 === this.config.port) {
            this.config.port = this._server.address().port;
        }
        return this;
    }
    /**
     * Stop the server
     *
     * @returns { Enviro.REST.Server }
     */
    stop() {
        if (this._server.listening) {
            this._server.close();
        }
        return this;
    }
}
exports.default = Server;
