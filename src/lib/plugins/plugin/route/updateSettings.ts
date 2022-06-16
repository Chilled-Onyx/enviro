import { deepMerge } from '../../../helpers';
import HTTPConstants from '../../../rest/httpConstants';
import Enviro from '../../../types';
import Logger from '../../../logging/logger';
import PluginAbstract from '../abstract';

class RouteUpdateSettings extends PluginAbstract {
  public async route(request: Enviro.REST.Request, response: Enviro.REST.Response): Promise<boolean> {
    const methodIncorrect = request.method !== HTTPConstants.METHOD.PATCH && request.method !== HTTPConstants.METHOD.PUT;
    if(methodIncorrect || '' === request.settings.name) {
      this.enviro.logger.log({group: `plugin-${this.constructor.name}`, level: Logger.ACCESS_LEVEL.DEBUG, message: 'route-rejected', extraData: {requestId: request.id}});
      return false;
    }

    this.enviro.logger.log({group: `plugin-${this.constructor.name}-accepted`, level: Logger.ACCESS_LEVEL.DEBUG, extraData: {requestId: request.id}});

    if(0 === Object.keys(request.body.parsed).length) {
      response.statusCode   = HTTPConstants.STATUS.BAD_REQUEST;
      response.body.message = 'No content provided for update.';
      return true;
    }

    let settings: Enviro.KeyValueStore;
    try {
      settings = await this.enviro.storage.read(request.settings.name);
    } catch {
      response.statusCode   = HTTPConstants.STATUS.NOT_FOUND;
      response.body.message = `${request.settings.name} not found.`;
      return true;
    }

    try {
      settings = (request.method === HTTPConstants.METHOD.PATCH) ?
        deepMerge(settings, request.body.parsed) :
        request.body.parsed;

      await this.enviro.storage.write(request.settings.name, settings);
    } catch {
      response.statusCode   = HTTPConstants.STATUS.INTERNAL_SERVER_ERROR;
      response.body.message = 'An unexpected error has occurred.';
      return true;
    }

    response.statusCode = HTTPConstants.STATUS.NO_CONTENT;
    return true;
  }
}

export default RouteUpdateSettings;