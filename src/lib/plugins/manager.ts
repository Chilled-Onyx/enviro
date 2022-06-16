import Enviro from '../types'

class Manager {
  protected _plugins: Enviro.Plugins.Plugin[] = [];

  /**
   * Add plugin to manager.
   * 
   * @param     { Enviro.Plugins.Plugin }    plugin    Plugin to add to manager.
   * @returns   { Enviro.Plugins.Manager }
   */
  public addPlugin(plugin: Enviro.Plugins.Plugin): this {
    this._plugins.push(plugin);
    return this;
  }

  /**
   * Authenticate request. If any plugin marks the request as invalid it is invalid.
   * 
   * @param     { Enviro.REST.Request }   request   Incoming request
   * @returns   { Promise<boolean> }
   */
  public async authenticateRequest(request: Enviro.REST.Request): Promise<boolean> {
    const plugins: Enviro.Plugins.Plugin[] = this.getPlugins('authenticateRequest');

    for(const plugin of plugins) {
      if(!await plugin.authenticateRequest!(request)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get plugins
   * 
   * @param     { string | null }               withMethod    The method plugins should include
   * @returns   { Enviro.Plugins.Plugin[] }
   */
  public getPlugins(withMethod: ((keyof Enviro.Plugins.Plugin) | null) = null): Enviro.Plugins.Plugin[] {
    if(null === withMethod) {
      return this._plugins;
    }

    return this._plugins.filter((plugin: Enviro.Plugins.Plugin) => undefined !== plugin[withMethod]);
  }

  /**
   * Process setting modifications
   * 
   * @param     {Enviro.KeyValueStore}    settings 
   * @returns   {Enviro.KeyValueStore}
   */
  public async processSettings(settings: Enviro.KeyValueStore): Promise<Enviro.KeyValueStore> {
    const plugins: Enviro.Plugins.Plugin[] = this.getPlugins('processSettings');

    for(const plugin of plugins) {
      settings = await plugin.processSettings!(settings);
    }

    return settings;
  }

  /**
   * Revert internal plugin list back to a blank array
   * 
   * @returns   { Enviro.Plugins.Manager }
   */
  public resetPlugins(): this {
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
  public async route(request: Enviro.REST.Request, response: Enviro.REST.Response): Promise<boolean> {
    const plugins: Enviro.Plugins.Plugin[] = this.getPlugins('route');

    for(const plugin of plugins) {
      if(await plugin.route!(request, response)) {
        return true;
      }
    }

    return false;
  }
}

export default Manager as Enviro.Plugins.ManagerStatic;