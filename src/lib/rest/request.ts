import Enviro                 from '../types';
import { IncomingMessage }      from 'http';
import { URL } from 'url';
import HTTPConstants            from './httpConstants';
import { isObject }             from '../helpers';

class Request extends IncomingMessage {
  public static readonly ERROR_INVALID_ACCEPT_TYPE: Enviro.ErrorMessageGenerator =
    (contentType: string) => `Request accept type is invalid. This server only produces '${HTTPConstants.CONTENT_TYPE.JSON}'. '${contentType}' requested.`;
  public static readonly ERROR_INVALID_CONTENT_SYNTAX: Enviro.ErrorMessageGenerator =
    () => 'Request body is not valid JSON.';
  public static readonly ERROR_INVALID_CONTENT_TYPE: Enviro.ErrorMessageGenerator =
    (contentType: string) => `Request content type is invalid. This server only processes ${HTTPConstants.CONTENT_TYPE.JSON}. '${contentType}' supplied.`;
  public static readonly ERROR_OVER_LIMIT_BODY_LENGTH: Enviro.ErrorMessageGenerator =
    () => `Request body is larger than the ${this.MAX_BODY_SIZE} byte limit.`;

  public static readonly VALID_ACCEPT_TYPES: string[] = [HTTPConstants.CONTENT_TYPE.ALL, HTTPConstants.CONTENT_TYPE.JSON];

  public static MAX_BODY_SIZE = 0;
  public static SECTION_SEPARATOR = '';

  public static logger: Enviro.Logging.Logger;

  public body: Enviro.REST.RequestBodyContainer = {raw: '', parsed: {}};
  public error: Enviro.REST.RequestErrorContainer = {code: 0, message: ''};
  public readonly id: string;
  public method = 'GET';
  public queryParameters: Enviro.KeyValueStore = {};
  public settings: Enviro.REST.RequestSettingsContainer = {name: '', section: '', raw: false};
  public url = '';

  protected _static: Enviro.REST.RequestStatic = this.constructor as Enviro.REST.RequestStatic;

  constructor(socket: Enviro.NodeSocket) {
    super(socket);

    this.id = this._generateId();

    this.on('data', this._eventHandlerData.bind(this));
    this.on('end',  this._eventHandlerEndValidator.bind(this));
    this.on('end', this._eventHandlerEndEmitter.bind(this));
  }

  /**
   * Processor for the data event emitted by IncomingMessage
   * 
   * @param     { Buffer | string }   dataChunk   Data coming in from client.
   * @returns   { void }
   */
  protected _eventHandlerData(dataChunk: Buffer | string): void {
    dataChunk = dataChunk.toString();

    if(this._static.MAX_BODY_SIZE < (this.body.raw.length + dataChunk.length)) {
      this.body.raw = '';
      this.removeAllListeners('data');

      this.error.code    = HTTPConstants.STATUS.PAYLOAD_TOO_LARGE;
      this.error.message = this._static.ERROR_OVER_LIMIT_BODY_LENGTH();

      return;
    }

    this.body.raw += dataChunk;
  }

  /**
   * Log request and emit proper event.
   * 
   * @returns { void }
   */
  protected _eventHandlerEndEmitter(): void {
    this._static.logger.log({
      group: 'rest-request-received',
      extraData: {
        requestId: this.id,
        ...this.getClientInformation(),
        error: this.error
      }
    });

    if(this.isErrored()) {
      this.emit('error', this.error);
      return;
    }

    this.emit('ready');
  }

  /**
   * Validate request data before marking request as ready
   * 
   * @returns   { void }
   */
  protected _eventHandlerEndValidator(): void {
    if(this.isErrored()) {
      return;
    }

    /** Query Params */
    const localUrl = new URL(this.url, 'http://www.example.com');
    localUrl.searchParams.forEach((value, key) => {
      this.queryParameters[key] = value;
    });

    /** Settings name parsing */
    const urlParts = localUrl.pathname
      .split(encodeURI(this._static.SECTION_SEPARATOR))
      .map(value => value.replace('/', ''));

    this.settings.name    = urlParts[0] || '';
    this.settings.section = urlParts[1] || '';
    this.settings.raw     = undefined !== this.queryParameters.raw;

    /** content-type */
    this.headers['content-type'] ||= '';
    if(null === this.headers['content-type'].match(HTTPConstants.CONTENT_TYPE.JSON) && '' !== this.body.raw) {
      this.error.code    = HTTPConstants.STATUS.UNSUPPORTED_MEDIA_TYPE;
      this.error.message = this._static.ERROR_INVALID_CONTENT_TYPE(this.headers['content-type']);
      return;
    }

    /** accept */
    this.headers.accept ||= HTTPConstants.CONTENT_TYPE.ALL;
    const suppliedAcceptTypes = this.headers.accept.split(',')
      .map((acceptType: string) => acceptType.replace(/;.*/, '')) // Remove parameters
      .filter((acceptType: string) => this._static.VALID_ACCEPT_TYPES.includes(acceptType)); // Filter out non-valid types

    if(0 === suppliedAcceptTypes.length) {
      this.error.code = HTTPConstants.STATUS.NOT_ACCEPTABLE;
      this.error.message = this._static.ERROR_INVALID_ACCEPT_TYPE(this.headers.accept);
      return;
    }

    /** Body Parsing */
    if(0 !== this.body.raw.length) {
      try {
        this.body.parsed = JSON.parse(this.body.raw);

        if(!isObject(this.body.parsed)) {
          throw '';
        }
      } catch {
        this.error.code = HTTPConstants.STATUS.BAD_REQUEST;
        this.error.message = this._static.ERROR_INVALID_CONTENT_SYNTAX();
        this.body.parsed = {};
        this.body.raw = '';
        return;
      }
    }
  }

  /**
   * Generate a unique ID for the request. This generates ~500 ids a millisecond
   * with no collisions in 1 million generated on my laptop. There is probably
   * a better way to go about this, but this works for now.
   * 
   * IDs are 15 characters long
   * 
   * @returns { string }
   */
  protected _generateId(): string {
    const now: string      = Date.now().toString(36);
    const appendage: string = Math.random().toString(36).substring(2, 8);

    return `${now}.${appendage}`;
  }

  public getClientInformation(): Enviro.REST.RequestClientInfo {
    return {
      headers: this.headers,
      ip: this.headers['x-forwarded-for'] as string || this.socket.remoteAddress!.toString(),
      method: this.method,
      url: this.url,
      userAgent: this.headers['user-agent'] as string
    };
  }

  /**
   * Check if the request has an error
   * 
   * @returns { boolean }
   */
  public isErrored(): boolean {return this.error.code !== 0;}
}

export default Request as Enviro.REST.RequestStatic;