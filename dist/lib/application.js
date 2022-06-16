"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./logging/logger");
const manager_1 = __importDefault(require("./plugins/manager"));
const server_1 = __importDefault(require("./rest/server"));
const events_1 = require("events");
const fs_1 = require("fs");
class Application extends events_1.EventEmitter {
    constructor(config = {}) {
        super();
        this._readyStack = { storage: false, logger: true, plugins: false, http: false };
        this.config = this.constructor.buildConfigObject(config);
        this.logger = new logger_1.Logger(this.config.log.level, this.config.log.formatted);
        this.pluginManager = new manager_1.default();
        this.rest = new server_1.default(this.config.http, this);
        Promise.resolve().then(() => __importStar(require(this.config.storage.name))).then((storageObject) => {
            this.storage = new storageObject.default(this.config.storage.options, this);
            this.emit('_storageReady');
        });
        this.on('_storageReady', this._loadPlugins);
        this._displayBanner();
    }
    _displayBanner() {
        if (!this.config.startup.display.banner) {
            return;
        }
        try {
            process.stdout.write((0, fs_1.readFileSync)('banner.txt').toString());
        }
        catch (_a) {
            process.stdout.write((0, fs_1.readFileSync)('dist/banner.txt').toString());
        }
        finally { /* Banner doesn't exist. Swallow error. */ }
    }
    _loadPlugins() {
        const pluginPromises = [];
        this.config.plugins.forEach(plugin => {
            pluginPromises.push(Promise.resolve().then(() => __importStar(require(plugin.name))).then((pluginObject) => {
                plugin.options.enviro = this;
                this.pluginManager.addPlugin(new pluginObject.default(plugin.options));
            }));
        });
        Promise.all(pluginPromises).then(() => {
            this.emit('ready');
        });
    }
    /**
     * Build config object
     *
     * @param     { Partial<Enviro.ConfigPrebuild> }    config    Partial configuration to be turned into full config object.
     * @returns   { Enviro.Config }
     */
    static buildConfigObject(config) {
        var _a, _b, _c, _d, _e;
        /**
         * HTTP
         */
        config.http = server_1.default.buildConfigObject(config.http || {});
        /**
         * Storage
         */
        if ('string' === typeof config.storage) {
            config.storage = { name: config.storage, options: {} };
        }
        config.storage || (config.storage = { name: './storage/jsonFile', options: {} });
        (_a = config.storage).name || (_a.name = './storage/jsonFile');
        (_b = config.storage).options || (_b.options = {});
        /**
         * Plugins
         */
        const defaultPlugins = [
            './plugins/plugin/extension',
            './plugins/plugin/route/createSettings',
            './plugins/plugin/route/deleteSettings',
            './plugins/plugin/route/readSettings',
            './plugins/plugin/route/updateSettings'
        ];
        config.plugins || (config.plugins = []);
        config.plugins = [...config.plugins, ...defaultPlugins];
        config.plugins.forEach((plugin, index) => {
            if ('string' === typeof plugin) {
                plugin = { name: plugin, options: {} };
            }
            plugin.options || (plugin.options = {});
            config.plugins[index] = plugin;
        });
        /**
         * Logger
         */
        config.log || (config.log = {});
        (_c = config.log).level || (_c.level = 20 /* Logger.ACCESS_LEVEL.ERROR */);
        (_d = config.log).formatted || (_d.formatted = false);
        /**
         * Startup display options
         */
        const defaultStartupConfig = { display: { banner: true, config: true } };
        config.startup || (config.startup = defaultStartupConfig);
        (_e = config.startup).display || (_e.display = defaultStartupConfig.display);
        config.startup.display = Object.assign(defaultStartupConfig.display, config.startup.display);
        return config;
    }
}
exports.default = Application;
