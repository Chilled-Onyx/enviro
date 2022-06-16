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
const httpConstants_1 = __importDefault(require("../../../rest/httpConstants"));
const abstract_1 = __importDefault(require("../abstract"));
class RouteCreateSettings extends abstract_1.default {
    route(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            if (request.method !== httpConstants_1.default.METHOD.POST || '' === request.settings.name) {
                this.enviro.logger.log({ group: `plugin-${this.constructor.name}-rejected`, level: 60 /* Logger.ACCESS_LEVEL.DEBUG */, extraData: { requestId: request.id } });
                return false;
            }
            this.enviro.logger.log({ group: `plugin-${this.constructor.name}-accepted`, level: 60 /* Logger.ACCESS_LEVEL.DEBUG */, extraData: { requestId: request.id } });
            try {
                yield this.enviro.storage.read(request.settings.name);
                response.statusCode = httpConstants_1.default.STATUS.CONFLICT;
                response.body = { message: `${request.settings.name} settings already exist.` };
                return true;
            }
            catch ( /** An error is expected here as the file should not exist. */_a) { /** An error is expected here as the file should not exist. */ }
            if (0 === Object.keys(request.body.parsed).length) {
                response.statusCode = httpConstants_1.default.STATUS.BAD_REQUEST;
                response.body = { message: 'No settings content was provided.' };
                return true;
            }
            try {
                yield this.enviro.storage.write(request.settings.name, request.body.parsed);
            }
            catch (_b) {
                response.statusCode = httpConstants_1.default.STATUS.INTERNAL_SERVER_ERROR,
                    response.body = { message: 'An unexpected error has occurred.' };
                return true;
            }
            response.statusCode = httpConstants_1.default.STATUS.NO_CONTENT;
            return true;
        });
    }
}
exports.default = RouteCreateSettings;
