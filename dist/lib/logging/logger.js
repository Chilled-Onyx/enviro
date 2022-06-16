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
exports.Logger = void 0;
const os_1 = require("os");
class Logger {
    constructor(logLevel = 30 /* Logger.ACCESS_LEVEL.WARNING */, formatted = false) {
        this.outputFunction = process.stdout.write.bind(process.stdout);
        this.whiteSpaceCount = 0;
        this.formatted = formatted;
        this.logLevel = logLevel;
    }
    /**
     * Build a complete log line from a partial one.
     *
     * @param     { Partial<Enviro.Logging.LogLine> }   partialLogLine
     * @returns   { Enviro.Logging.LogLine }
     */
    getLogLine(partialLogLine) {
        partialLogLine.level || (partialLogLine.level = 50 /* Logger.ACCESS_LEVEL.INFORMATION */);
        partialLogLine.time || (partialLogLine.time = new Date().toISOString());
        partialLogLine.group || (partialLogLine.group = '');
        partialLogLine.message || (partialLogLine.message = '');
        partialLogLine.pid || (partialLogLine.pid = process.pid);
        partialLogLine.hostname || (partialLogLine.hostname = (0, os_1.hostname)());
        partialLogLine.extraData || (partialLogLine.extraData = {});
        return partialLogLine;
    }
    /**
     * Build a full log line, and send it to the output function if it meets log level requirements.
     *
     * @param     { Partial<Enviro.Logging.LogLine> } partialLogLine
     * @returns   { Promise<Enviro.Logging.Logger> }
     */
    log(partialLogLine) {
        return __awaiter(this, void 0, void 0, function* () {
            if ('string' === typeof partialLogLine) {
                partialLogLine = { message: partialLogLine };
            }
            const logLine = this.getLogLine(partialLogLine);
            if (logLine.level <= this.logLevel) {
                let whiteSpaceCount = 0;
                if (this.formatted) {
                    whiteSpaceCount = 2;
                }
                this.outputFunction(JSON.stringify(logLine, null, whiteSpaceCount) + '\n\n');
            }
            return this;
        });
    }
}
exports.Logger = Logger;
exports.default = Logger;
