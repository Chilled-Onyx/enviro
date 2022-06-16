"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PluginAbstract {
    constructor(pluginOptions) {
        this.enviro = pluginOptions.enviro;
        delete pluginOptions.enviro;
        this.options = pluginOptions;
        this.enviro.logger.log({
            group: `plugins-${this.constructor.name}-loaded`,
            level: 60 /* Logger.ACCESS_LEVEL.DEBUG */,
            extraData: { options: this.options }
        });
    }
}
exports.default = PluginAbstract;
