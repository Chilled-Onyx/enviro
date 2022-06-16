"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    http: {
        certificate: '',
        key: '',
        maxBodySize: 10,
        port: 80,
        settingsSectionSeparator: '>'
    },
    log: {
        level: 30 /* Logger.ACCESS_LEVEL.WARNING */,
        formatted: false
    },
    plugins: [],
    startup: {
        display: {
            banner: true,
            config: true
        }
    },
    storage: {
        name: './storage/jsonFile',
        options: {
            path: './storage'
        }
    }
};
exports.default = config;
