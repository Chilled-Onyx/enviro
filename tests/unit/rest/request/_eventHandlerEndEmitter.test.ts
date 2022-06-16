jest.mock('http');

import Enviro      from '../../../../src/lib/types';
import Request       from '../../../../src/lib/rest/request';
import httpMock      from 'http';

describe('Enviro.REST.Request::_eventHandlerData', () => {
  const blankSocket: Enviro.NodeSocket = {} as Enviro.NodeSocket;
  let testRequest: Enviro.REST.Request;
  let testHandler: () => void

  beforeEach(() => {
    jest.spyOn(httpMock.IncomingMessage.prototype, 'on').mockImplementation((event, func) => {
      if('end' === event) {
        testHandler = func;
      }
      
      return null as httpMock.IncomingMessage;
    });
    jest.spyOn(Request.prototype, 'getClientInformation').mockReturnValue({clientInfo: true});

    Request.logger = {log: jest.fn()} as unknown as Enviro.Logging.Logger;

    testRequest = new Request(blankSocket);
  });

  it('it emits ready', () => {
    jest.spyOn(testRequest, 'emit');

    testHandler();

    expect(testRequest.emit).toHaveBeenCalledTimes(1);
    expect(testRequest.emit).toHaveBeenNthCalledWith(1, 'ready');
  });

  it('it emits errors', () => {
    jest.spyOn(testRequest, 'emit');
    testRequest.error.code = 100;

    testHandler();

    expect(testRequest.emit).toHaveBeenCalledTimes(1);
    expect(testRequest.emit).toHaveBeenNthCalledWith(1, 'error', testRequest.error);
  });
});