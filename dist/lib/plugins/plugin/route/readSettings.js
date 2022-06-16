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
const helpers_1 = require("../../../helpers");
const httpConstants_1 = __importDefault(require("../../../rest/httpConstants"));
const abstract_1 = __importDefault(require("../abstract"));
class RouteReadSettings extends abstract_1.default {
    route(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            if (request.method !== httpConstants_1.default.METHOD.GET || '' === request.settings.name) {
                this.enviro.logger.log({ group: `plugin-${this.constructor.name}`, level: 60 /* Logger.ACCESS_LEVEL.DEBUG */, message: 'route-rejected', extraData: { requestId: request.id } });
                return false;
            }
            this.enviro.logger.log({ group: `plugin-${this.constructor.name}-accepted`, level: 60 /* Logger.ACCESS_LEVEL.DEBUG */, extraData: { requestId: request.id } });
            let settings;
            try {
                settings = yield this.enviro.storage.read(request.settings.name);
            }
            catch (_a) {
                response.statusCode = httpConstants_1.default.STATUS.NOT_FOUND;
                response.body = { message: `${request.settings.name} not found.` };
                return true;
            }
            if ('' !== request.settings.section) {
                if (undefined === settings[request.settings.section]) {
                    response.statusCode = httpConstants_1.default.STATUS.NOT_FOUND;
                    response.body = { message: `${request.settings.name} has no ${request.settings.section} subsection.` };
                    return true;
                }
                settings = settings[request.settings.section];
                if (!(0, helpers_1.isObject)(settings)) {
                    settings = { [request.settings.section]: settings };
                }
            }
            if (!request.settings.raw) {
                try {
                    settings = yield this.enviro.pluginManager.processSettings(settings);
                }
                catch (_b) {
                    response.statusCode = httpConstants_1.default.STATUS.INTERNAL_SERVER_ERROR;
                    response.body = { message: `Error processing stored settings.` };
                    return true;
                }
            }
            response.body = settings;
            return true;
        });
    }
}
exports.default = RouteReadSettings;
