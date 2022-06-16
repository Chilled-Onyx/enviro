import HTTPConstants from '../../../rest/httpConstants';
import Enviro from '../../../types';
import Logger from '../../../logging/logger';
import PluginAbstract from '../abstract';

class RouteCreateSettings extends PluginAbstract {
  public async route(request: Enviro.REST.Request, response: Enviro.REST.Response): Promise<boolean> {
    if(request.method !== HTTPConstants.METHOD.POST || '' === request.settings.name) {
      this.enviro.logger.log({group: `plugin-${this.constructor.name}-rejected`, level: Logger.ACCESS_LEVEL.DEBUG, extraData: {requestId: request.id}});
      return false;
    }

    this.enviro.logger.log({group: `plugin-${this.constructor.name}-accepted`, level: Logger.ACCESS_LEVEL.DEBUG, extraData: {requestId: request.id}});

    try {
      await this.enviro.storage.read(request.settings.name);

      response.statusCode = HTTPConstants.STATUS.CONFLICT;
      response.body       = { message: `${request.settings.name} settings already exist.` };
      return true;
    } catch {/** An error is expected here as the file should not exist. */}

    if(0 === Object.keys(request.body.parsed).length) {
      response.statusCode = HTTPConstants.STATUS.BAD_REQUEST;
      response.body       = { message: 'No settings content was provided.' };
      return true;
    }

    try {
      await this.enviro.storage.write(request.settings.name, request.body.parsed);
    } catch {
      response.statusCode = HTTPConstants.STATUS.INTERNAL_SERVER_ERROR,
      response.body       = { message: 'An unexpected error has occurred.' };
      return true;
    }

    response.statusCode = HTTPConstants.STATUS.NO_CONTENT;

    return true;
  }
}

export default RouteCreateSettings;