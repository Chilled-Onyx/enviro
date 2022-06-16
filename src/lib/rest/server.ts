import Enviro from '../types';
import {
  createServer    as createServerHTTP,
  Server          as HTTPServer,
  RequestListener
} from 'http';
import {
  createServer    as createServerHTTPS,
  ServerOptions
} from 'https';
import { AddressInfo } from 'net';
import Request from './request';
import Response from './response';
import HTTPConstants from './httpConstants';

const ONE_MEGABYTE: number = Math.pow(10, 6);

class Server {
  protected _server: HTTPServer;

  public readonly config: Enviro.REST.Config;
  public readonly enviro: Enviro.Application;

  constructor(config: Partial<Enviro.REST.Config>, enviro: Enviro.Application) {
    this.config   = (this.constructor as Enviro.REST.ServerStatic).buildConfigObject(config);
    this.enviro = enviro;

    Request.MAX_BODY_SIZE     = this.config.maxBodySize;
    Request.SECTION_SEPARATOR = this.config.settingsSectionSeparator;
    Request.logger            = Response.logger = enviro.logger;

    const serverOptions: ServerOptions = {
      IncomingMessage: Request as unknown as typeof Enviro.REST.Request,
      ServerResponse: Response as unknown as typeof Enviro.REST.Response
    };
    let createServer: (opts: ServerOptions, listener: RequestListener) => HTTPServer = createServerHTTP;

    if('' !== this.config.certificate && '' !== this.config.key) {
      serverOptions.cert = this.config.certificate;
      serverOptions.key  = this.config.key;
      createServer       = createServerHTTPS;
    }

    this._server = createServer(
      serverOptions,
      this._requestHandler.bind(this) as unknown as RequestListener
    );
  }

  protected async _requestHandler(request: Enviro.REST.Request, response: Enviro.REST.Response): Promise<void> {
    request.on('error', () => {
      response.statusCode = request.error.code;
      response.body       = { message: request.error.message };
      response.end();
    });

    request.on('ready', async () => {
      if(!await this.enviro.pluginManager.route(request, response)) {
        response.statusCode = HTTPConstants.STATUS.NOT_FOUND;
        response.body       = { message: 'Not found.' };
      }

      response.end();
    });
  }

  /**
   * Build config object
   * 
   * @param       { Partial<Enviro.REST.Config> }     config    Partial configuration to be turned into full config object.
   * @returns     { Enviro.REST.Config }
   */
  public static buildConfigObject(config: Partial<Enviro.REST.Config>): Enviro.REST.Config {
    config.certificate              ||= '';
    config.key                      ||= '';
    config.maxBodySize              ||= ONE_MEGABYTE;
    config.port                     = (config.port || config.port === 0) ? config.port : 80;
    config.settingsSectionSeparator ||= '>';

    return config as Enviro.REST.Config;
  }

  /**
   * Start the server
   * 
   * @returns { Enviro.REST.Server }
   */
  public start(): this {
    if(this._server.listening) {
      return this;
    }

    this._server.listen(this.config.port);

    if(0 === this.config.port) {
      this.config.port = (this._server.address() as AddressInfo).port;
    }

    return this;
  }

  /**
   * Stop the server
   * 
   * @returns { Enviro.REST.Server }
   */
  public stop(): this {
    if(this._server.listening) {
      this._server.close();
    }

    return this;
  }
}

export default Server as Enviro.REST.ServerStatic;