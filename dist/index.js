"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const application_1 = __importDefault(require("./lib/application"));
const config_1 = __importDefault(require("./config"));
const enviro = new application_1.default(config_1.default);
enviro.rest.start();
