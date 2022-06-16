jest.mock('http');

import Enviro      from '../../../../src/lib/types';
import Request       from '../../../../src/lib/rest/request';
import httpMock      from 'http';
import HTTPConstants from '../../../../src/lib/rest/httpConstants';

describe('Enviro.REST.Request::_eventHandlerData', () => {
  const blankSocket: Enviro.NodeSocket = {} as Enviro.NodeSocket;
  let testRequest: Enviro.REST.Request;
  let testDataHandler: (dataChunk: Buffer | string) => void

  afterEach(() => {
    testRequest = undefined;
    testDataHandler = undefined;

    Request.MAX_BODY_SIZE = 0;
  });

  beforeEach(() => {
    jest.spyOn(httpMock.IncomingMessage.prototype, 'on').mockImplementation((event, func) => {
      if('data' === event) {
        testDataHandler = func;
      }
      
      return null as httpMock.IncomingMessage;
    });
  });

  it('it adds to raw data', () => {
    Request.MAX_BODY_SIZE = 9001;
    const dataOne = 'testing data one';
    const dataTwo = 'testing data two';
    testRequest = new Request(blankSocket);

    testDataHandler(dataOne);
    expect(testRequest.body.raw).toBe(dataOne);

    testDataHandler(dataTwo);
    expect(testRequest.body.raw).toBe(dataOne+dataTwo);
  });

  it('errors when you go over max body size', () => {
    Request.MAX_BODY_SIZE = 11;
    const data = '1234567890';
    testRequest = new Request(blankSocket);

    jest.spyOn(httpMock.IncomingMessage.prototype, 'removeAllListeners');

    testDataHandler(data);
    expect(testRequest.body.raw).toBe(data);

    testDataHandler(data);
    expect(testRequest.body.raw).toBe('');
    expect(httpMock.IncomingMessage.prototype.removeAllListeners).toHaveBeenCalledTimes(1);
    expect(httpMock.IncomingMessage.prototype.removeAllListeners).toHaveBeenNthCalledWith(1, 'data');
    expect(testRequest.error.code).toBe(HTTPConstants.STATUS.PAYLOAD_TOO_LARGE);
    expect(testRequest.error.message).toBe(Request.ERROR_OVER_LIMIT_BODY_LENGTH());
    expect(httpMock.IncomingMessage.prototype.emit).toHaveBeenCalledTimes(0);
  });
});