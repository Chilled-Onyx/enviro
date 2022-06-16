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
const helpers_1 = require("../../helpers");
const abstract_1 = __importDefault(require("./abstract"));
class PluginExtension extends abstract_1.default {
    processSettings(settings) {
        return __awaiter(this, void 0, void 0, function* () {
            const localSettings = Object.assign({}, settings);
            if ('string' === typeof localSettings._extends) {
                localSettings._extends = [localSettings._extends];
            }
            localSettings._extends || (localSettings._extends = []);
            let returnSettings = {};
            for (const settingsName of localSettings._extends) {
                const tmpParts = settingsName.split(this.enviro.config.http.settingsSectionSeparator);
                const settingsParts = {
                    name: tmpParts[0],
                    section: tmpParts[1] || '',
                    raw: false
                };
                let newSettings = yield this.enviro.storage.read(settingsParts.name);
                if ('' !== settingsParts.section) {
                    if (undefined === newSettings[settingsParts.section]) {
                        throw `Unable to find ${settingsParts.section} in ${settingsParts.name}`;
                    }
                    newSettings = newSettings[settingsParts.section];
                    if (!(0, helpers_1.isObject)(newSettings)) {
                        newSettings = { [settingsParts.section]: newSettings };
                    }
                }
                returnSettings = (0, helpers_1.deepMerge)(returnSettings, yield this.processSettings(newSettings));
            }
            for (const child of Object.keys(settings)) {
                if ((0, helpers_1.isObject)(localSettings[child])) {
                    localSettings[child] = yield this.processSettings(localSettings[child]);
                }
            }
            returnSettings = (0, helpers_1.deepMerge)(returnSettings, localSettings);
            delete returnSettings._extends;
            this.enviro.logger.log({
                group: `plugin-${this.constructor.name}-settings-processed`,
                level: 60 /* Logger.ACCESS_LEVEL.DEBUG */,
                extraData: { original: settings, processed: returnSettings }
            });
            return returnSettings;
        });
    }
}
exports.default = PluginExtension;
