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
class Manager {
    constructor() {
        this._plugins = [];
    }
    /**
     * Add plugin to manager.
     *
     * @param     { Enviro.Plugins.Plugin }    plugin    Plugin to add to manager.
     * @returns   { Enviro.Plugins.Manager }
     */
    addPlugin(plugin) {
        this._plugins.push(plugin);
        return this;
    }
    /**
     * Authenticate request. If any plugin marks the request as invalid it is invalid.
     *
     * @param     { Enviro.REST.Request }   request   Incoming request
     * @returns   { Promise<boolean> }
     */
    authenticateRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const plugins = this.getPlugins('authenticateRequest');
            for (const plugin of plugins) {
                if (!(yield plugin.authenticateRequest(request))) {
                    return false;
                }
            }
            return true;
        });
    }
    /**
     * Get plugins
     *
     * @param     { string | null }               withMethod    The method plugins should include
     * @returns   { Enviro.Plugins.Plugin[] }
     */
    getPlugins(withMethod = null) {
        if (null === withMethod) {
            return this._plugins;
        }
        return this._plugins.filter((plugin) => undefined !== plugin[withMethod]);
    }
    /**
     * Process setting modifications
     *
     * @param     {Enviro.KeyValueStore}    settings
     * @returns   {Enviro.KeyValueStore}
     */
    processSettings(settings) {
        return __awaiter(this, void 0, void 0, function* () {
            const plugins = this.getPlugins('processSettings');
            for (const plugin of plugins) {
                settings = yield plugin.processSettings(settings);
            }
            return settings;
        });
    }
    /**
     * Revert internal plugin list back to a blank array
     *
     * @returns   { Enviro.Plugins.Manager }
     */
    resetPlugins() {
        this._plugins = [];
        return this;
    }
    /**
     * Attempt to route a request. First plugin to say it processed the request wins.
     *
     * @param     { Enviro.REST.Request }   request   Incoming request
     * @param     { Enviro.REST.Response }  response  Outgoing response
     * @returns   { Promise<boolean> }
     */
    route(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const plugins = this.getPlugins('route');
            for (const plugin of plugins) {
                if (yield plugin.route(request, response)) {
                    return true;
                }
            }
            return false;
        });
    }
}
exports.default = Manager;
