jest.mock('http');

import Enviro from '../../../../src/lib/types';
import Response from '../../../../src/lib/rest/response';
import httpMock from 'http';

describe('Enviro.REST.Response::writeBody', () => {
  const blankRequest = {} as unknown as Enviro.REST.Request;
  let testResponse: Enviro.REST.Response;

  beforeEach(() => {
    testResponse = new Response(blankRequest);
  });

  it('should return itself', () => {
    expect(testResponse.writeBody()).toBe(testResponse);
  });

  it('should ignore writing if no body is set', () => {
    testResponse.writeBody();

    expect(httpMock.ServerResponse.prototype.write).not.toHaveBeenCalled();
  });

  it('should write the body as a string', () => {
    testResponse.body = {test: 1};

    jest.spyOn(httpMock.ServerResponse.prototype, 'write').mockReturnValue(true);

    testResponse.writeBody();
    expect(httpMock.ServerResponse.prototype.write).toHaveBeenCalledTimes(1);
    expect(httpMock.ServerResponse.prototype.write).toHaveBeenNthCalledWith(1, JSON.stringify(testResponse.body));
    expect(testResponse.bodyWritten).toBe(true);
  });

  it('will not write the body if it has already been written', () => {
    testResponse.body = {test: 2};

    jest.spyOn(httpMock.ServerResponse.prototype, 'write').mockReturnValue(true);

    testResponse.writeBody();
    expect(httpMock.ServerResponse.prototype.write).toHaveBeenCalledTimes(1);
    expect(httpMock.ServerResponse.prototype.write).toHaveBeenNthCalledWith(1, JSON.stringify(testResponse.body));
    expect(testResponse.bodyWritten).toBe(true);
    testResponse.writeBody();
    expect(httpMock.ServerResponse.prototype.write).toHaveBeenCalledTimes(1);
  });
});