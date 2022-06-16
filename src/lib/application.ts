import Enviro, { DeepPartial } from './types';

import { Logger } from './logging/logger';
import Manager from './plugins/manager';
import RESTServer from './rest/server';
import { EventEmitter } from 'events';
import { readFileSync } from 'fs';

class Application extends EventEmitter {
  protected _readyStack: Enviro.KeyValueStore = {storage: false, logger: true, plugins: false, http: false};
  public config: Enviro.Config;
  public logger: Enviro.Logging.Logger;
  public pluginManager: Enviro.Plugins.Manager;
  public rest: Enviro.REST.Server;
  public storage: Enviro.Storage | undefined;

  constructor(config: DeepPartial<Enviro.ConfigPrebuild> = {}) {
    super();
    this.config        = (this.constructor as unknown as Enviro.ApplicationStatic).buildConfigObject(config);
    this.logger        = new Logger(this.config.log.level, this.config.log.formatted);
    this.pluginManager = new Manager();
    this.rest          = new RESTServer(this.config.http, this as Enviro.Application);

    import(this.config.storage.name).then((storageObject) => {
      this.storage = new storageObject.default(this.config.storage.options, this);
      this.emit('_storageReady');
    });

    this.on('_storageReady', this._loadPlugins);

    this._displayBanner();
  }

  protected _displayBanner() {
    if(!this.config.startup.display.banner) {
      return;
    }

    try {
      process.stdout.write(readFileSync('banner.txt').toString());
    } catch {
      process.stdout.write(readFileSync('dist/banner.txt').toString());
    } finally {/* Banner doesn't exist. Swallow error. */}
  }

  protected _loadPlugins(): void {
    const pluginPromises: Promise<void>[] = [];

    this.config.plugins.forEach(plugin => {
      pluginPromises.push(import(plugin.name).then((pluginObject) => {
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
  public static buildConfigObject(config: DeepPartial<Enviro.ConfigPrebuild>): Enviro.Config {
    /**
     * HTTP
     */
    config.http   = RESTServer.buildConfigObject(config.http || {});

    /**
     * Storage
     */
    if('string' === typeof config.storage) {
      config.storage = {name: config.storage, options: {}};
    }
    config.storage ||= {name: './storage/jsonFile', options: {}};
    (config.storage as Enviro.NameAndOptionsStore).name     ||= './storage/jsonFile';
    (config.storage as Enviro.NameAndOptionsStore).options  ||= {};

    /**
     * Plugins
     */
    const defaultPlugins: string[] = [
      './plugins/plugin/extension',
      './plugins/plugin/route/createSettings',
      './plugins/plugin/route/deleteSettings',
      './plugins/plugin/route/readSettings',
      './plugins/plugin/route/updateSettings'
    ];

    config.plugins ||= [];
    config.plugins = [...config.plugins, ...defaultPlugins];
    (config.plugins as Enviro.Config['plugins']).forEach((plugin: Enviro.NameAndOptionsStore, index: number) => {
      if('string' === typeof plugin) {
        plugin = {name: plugin, options: {}};
      }

      plugin.options ||= {};

      (config.plugins as Enviro.Config['plugins'])[index] = plugin;
    });

    /**
     * Logger
     */
    config.log           ||= {};
    config.log.level     ||= Logger.ACCESS_LEVEL.ERROR;
    config.log.formatted ||= false;

    /**
     * Startup display options
     */
    const defaultStartupConfig = {display: {banner: true, config: true}};
    config.startup           ||= defaultStartupConfig;
    config.startup.display   ||= defaultStartupConfig.display;
    config.startup.display     = Object.assign(defaultStartupConfig.display, config.startup.display);

    return config as Enviro.Config;
  }
}

export default Application as Enviro.ApplicationStatic;