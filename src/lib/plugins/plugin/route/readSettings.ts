import { isObject } from '../../../helpers';
import HTTPConstants from '../../../rest/httpConstants';
import Logger from '../../../logging/logger';
import Enviro from '../../../types';

import PluginAbstract from '../abstract';

class RouteReadSettings extends PluginAbstract {
  public async route(request: Enviro.REST.Request, response: Enviro.REST.Response): Promise<boolean> {
    if(request.method !== HTTPConstants.METHOD.GET || '' === request.settings.name) {
      this.enviro.logger.log({group: `plugin-${this.constructor.name}`, level: Logger.ACCESS_LEVEL.DEBUG, message: 'route-rejected', extraData: {requestId: request.id}});
      return false;
    }

    this.enviro.logger.log({group: `plugin-${this.constructor.name}-accepted`, level: Logger.ACCESS_LEVEL.DEBUG, extraData: {requestId: request.id}});

    let settings: Enviro.KeyValueStore;

    try {
      settings = await this.enviro.storage.read(request.settings.name);
    } catch {
      response.statusCode = HTTPConstants.STATUS.NOT_FOUND;
      response.body       = { message: `${request.settings.name} not found.` };
      return true;
    }

    if('' !== request.settings.section) {
      if(undefined === settings[request.settings.section]) {
        response.statusCode = HTTPConstants.STATUS.NOT_FOUND;
        response.body       = { message: `${request.settings.name} has no ${request.settings.section} subsection.` };
        return true;
      }

      settings = settings[request.settings.section] as Enviro.KeyValueStore;

      if(!isObject(settings)) {
        settings = { [request.settings.section]: settings };
      }
    }

    if(!request.settings.raw) {
      try {
        settings = await this.enviro.pluginManager.processSettings(settings);
      } catch {
        response.statusCode = HTTPConstants.STATUS.INTERNAL_SERVER_ERROR;
        response.body       = { message: `Error processing stored settings.` };
        return true;
      }
    }

    response.body = settings;

    return true;
  }
}

export default RouteReadSettings;