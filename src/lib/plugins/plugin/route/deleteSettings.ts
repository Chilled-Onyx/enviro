import HTTPConstants from '../../../rest/httpConstants';
import Enviro from '../../../types';
import Logger from '../../../logging/logger';
import PluginAbstract from '../abstract';

class RouteDeleteSettings extends PluginAbstract {
  public async route(request: Enviro.REST.Request, response: Enviro.REST.Response): Promise<boolean> {
    if(request.method !== HTTPConstants.METHOD.DELETE || '' === request.settings.name) {
      this.enviro.logger.log({group: `plugin-${this.constructor.name}-rejected`, level: Logger.ACCESS_LEVEL.DEBUG, extraData: {requestId: request.id}});
      return false;
    }

    this.enviro.logger.log({group: `plugin-${this.constructor.name}-accepted`, level: Logger.ACCESS_LEVEL.DEBUG, extraData: {requestId: request.id}});

    try {
      await this.enviro.storage.read(request.settings.name);
    } catch {
      response.statusCode = HTTPConstants.STATUS.NOT_FOUND;
      response.body       = { message: `${request.settings.name} does not exist.` };
      return true;
    }

    try {
      await this.enviro.storage.delete(request.settings.name);
    } catch {
      response.statusCode = HTTPConstants.STATUS.INTERNAL_SERVER_ERROR;
      response.body       = { message: 'An unexpected error has occurred.' };
      return true;
    }

    response.statusCode = HTTPConstants.STATUS.NO_CONTENT;

    return true;
  }
}

export default RouteDeleteSettings;