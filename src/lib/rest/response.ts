import Enviro           from '../types';
import { ServerResponse } from 'http';
import HTTPConstants from './httpConstants';

class Response extends ServerResponse {
  public body: Enviro.KeyValueStore = {};
  public bodyWritten = false;

  public static logger: Enviro.Logging.Logger;

  public req: Enviro.REST.Request;
  public statusCode: number = HTTPConstants.STATUS.OKAY;

  protected _static: Enviro.REST.ResponseStatic = this.constructor as Enviro.REST.ResponseStatic;

  constructor(request: Enviro.REST.Request) {
    super(request);

    this.req = request;
    this.setHeader('Content-Type', HTTPConstants.CONTENT_TYPE.JSON);
  }

  /**
   * End connection after writing body.
   * 
   * @param     { any }                     params  Any properties you would pass to { @see ServerResponse.end }
   * @returns   { Enviro.REST.Response }
   */
  public end(cb?: () => void): this {
    this.writeBody();

    this._static.logger.log({
      group: 'rest-response-sent',
      extraData: {
        requestId: this.req.id,
        response: {
          body: this.body,
          status: this.statusCode
        },
      }
    });

    return super.end(cb);
  }

  /**
   * Write body to output buffer if it has content.
   * Can only be done if the body hasn't already been written.
   * 
   * @returns { Enviro.REST.Response }
   */
  public writeBody(): this {
    if(0 !== Object.keys(this.body).length && !this.bodyWritten) {
      this.bodyWritten = this.write(JSON.stringify(this.body));
    }

    return this;
  }
}

export default Response as unknown as Enviro.REST.ResponseStatic;