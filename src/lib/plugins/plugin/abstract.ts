import Enviro from '../../types';
import Logger from '../../logging/logger';

class PluginAbstract {
  public readonly enviro: Enviro.Application;
  public readonly options: Enviro.KeyValueStore;

  constructor(pluginOptions: Enviro.Plugins.PluginOptions) {
    this.enviro = pluginOptions.enviro;

    delete (pluginOptions as Enviro.KeyValueStore).enviro;

    this.options = pluginOptions;

    this.enviro.logger.log({
      group: `plugins-${this.constructor.name}-loaded`,
      level: Logger.ACCESS_LEVEL.DEBUG,
      extraData: {options: this.options}
    });
  }
}

export default PluginAbstract as typeof Enviro.Plugins.Plugin;