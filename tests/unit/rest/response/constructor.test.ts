jest.mock('http');

import Enviro from '../../../../src/lib/types';
import Response from '../../../../src/lib/rest/response';
import httpMock from 'http';
import HTTPConstants from '../../../../src/lib/rest/httpConstants';

describe('Enviro.REST.Response::constructor', () => {
  const blankRequest = {} as unknown as Enviro.REST.Request;

  it('should set content-type header', () => {
    new Response(blankRequest);
    expect(httpMock.ServerResponse.prototype.setHeader).toHaveBeenCalledTimes(1);
    expect(httpMock.ServerResponse.prototype.setHeader).toHaveBeenNthCalledWith(1, 'Content-Type', HTTPConstants.CONTENT_TYPE.JSON);
  });
});