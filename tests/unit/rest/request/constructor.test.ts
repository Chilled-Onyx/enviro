jest.mock('http');

import Enviro from '../../../../src/lib/types';
import Request  from '../../../../src/lib/rest/request';
import httpMock from 'http';

describe('Enviro.REST.Request::constructor', () => {
  const blankSocket: Enviro.NodeSocket = {} as Enviro.NodeSocket;
  let testRequest: Enviro.REST.Request;

  afterEach(() => {
    testRequest = undefined;
  });

  it('it generates an ID', () => {
    testRequest = new Request(blankSocket);

    expect(testRequest.id).toMatch(/^[a-z\d]{8}\.[a-z\d]{6}$/);
  });

  it('it adds listeners for relevant events', () => {
    const dataHandlers = {};
    jest.spyOn(Request.prototype, '_eventHandlerData').mockReturnThis();
    jest.spyOn(Request.prototype, '_eventHandlerEndValidator').mockReturnThis();
    jest.spyOn(Request.prototype, '_eventHandlerEndEmitter').mockReturnThis();
    jest.spyOn(httpMock.IncomingMessage.prototype, 'on').mockImplementation((event, func) => {
      dataHandlers[event] ||= [];
      dataHandlers[event].push(func);
      
      return null as httpMock.IncomingMessage;
    });

    testRequest = new Request(blankSocket);

    expect(dataHandlers['data'][0]).not.toBeUndefined();
    expect(dataHandlers['data'][0]()).toBe(testRequest);

    expect(dataHandlers['end'][0]).not.toBeUndefined();
    expect(dataHandlers['end'][0]()).toBe(testRequest);

    expect(dataHandlers['end'][1]).not.toBeUndefined();
    expect(dataHandlers['end'][1]()).toBe(testRequest);
  });
});