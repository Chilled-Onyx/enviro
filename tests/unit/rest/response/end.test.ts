jest.mock('http');

import Enviro from '../../../../src/lib/types';
import Response from '../../../../src/lib/rest/response';
import httpMock from 'http';

describe('Enviro.REST.Response::end', () => {
  const blankRequest = {
    id: 'test-response',
    getClientInformation: jest.fn()
  } as unknown as Enviro.REST.Request;
  let testResponse: Enviro.REST.Response;

  beforeEach(() => {
    testResponse = new Response(blankRequest);
    Response.logger = {
      log: jest.fn()
    } as unknown as Enviro.Logging.Logger;
  });

  it('should call parents end', () => {
    const cb: () => void = () => null;
    const clientInfo = {clientInfo: true};
    const body = {body: true};
    (blankRequest.getClientInformation as jest.Mock).mockReturnValueOnce(clientInfo);

    testResponse.statusCode = 201;
    testResponse.body = body;

    testResponse.end(cb);

    jest.spyOn(httpMock.ServerResponse.prototype, 'end').mockReturnThis();

    expect(httpMock.ServerResponse.prototype.end).toHaveBeenCalledTimes(1);
    expect(httpMock.ServerResponse.prototype.end).toHaveBeenNthCalledWith(1, cb);
    expect(Response.logger.log).toHaveBeenCalledTimes(1);
    expect(Response.logger.log).toHaveBeenNthCalledWith(1, {
      group: 'rest-response-sent',
      extraData: {
        response: {
          status: 201,
          body
        },
        requestId: 'test-response'
      }
    });
  });
});