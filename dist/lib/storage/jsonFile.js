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
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const path_1 = require("path");
const fs_1 = require("fs");
class JSONFile {
    constructor(config, enviro) {
        var _a;
        this.config = config;
        this.enviro = enviro;
        (_a = this.config).path || (_a.path = './storage');
        this._createStorageDirectory();
    }
    _createStorageDirectory() {
        if (!(0, fs_1.existsSync)(this.config.path)) {
            (0, fs_1.mkdirSync)(this.config.path, { recursive: true });
        }
    }
    _getFilePath(settingsName) {
        return (0, path_1.join)(this.config.path, `${settingsName}.json`);
    }
    delete(settingsName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, promises_1.rm)(this._getFilePath(settingsName));
            }
            catch (_a) {
                throw 'Unable to delete file.';
            }
        });
    }
    read(settingsName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const content = yield (0, promises_1.readFile)(this._getFilePath(settingsName), 'utf8');
                return JSON.parse(content);
            }
            catch (_a) {
                throw 'Unable to read file.';
            }
        });
    }
    write(settingsName, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, promises_1.writeFile)(this._getFilePath(settingsName), JSON.stringify(settings));
            }
            catch (_a) {
                throw 'Unable to write file.';
            }
        });
    }
}
exports.default = JSONFile;
