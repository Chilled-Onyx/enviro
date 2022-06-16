jest.mock('http');
jest.mock('https');
jest.mock('../../../../src/lib/application');
jest.mock('../../../../src/lib/rest/request');
jest.mock('../../../../src/lib/rest/response');
jest.mock('net');

import Enviro     from '../../../../src/lib/types';
import Server       from '../../../../src/lib/rest/server';
import requestMock  from '../../../../src/lib/rest/request';
import responseMock from '../../../../src/lib/rest/response';
import Application  from '../../../../src/lib/application';
import { Socket }   from 'net';
import httpMock     from 'http';
import HTTPConstants from '../../../../src/lib/rest/httpConstants';

describe('Enviro.REST.Server::_requestHandler', () => {
  let mockApplication: Enviro.Application;
  let mockRequest: Enviro.REST.Request;
  let mockResponse: Enviro.REST.Response;
  let requestHandler: httpMock.RequestListener;
  let errorFunction;
  let readyFunction;

  beforeEach(() => {
    (httpMock.createServer as jest.Mock).mockImplementation((options, requestListener) => {
      requestHandler = requestListener;
    });

    mockApplication = new Application({startup: {display: {banner: false}}});
    mockApplication.pluginManager = {
      route: jest.fn()
    } as unknown as Enviro.Plugins.Manager;

    mockRequest = new requestMock(new Socket());
    mockRequest.error = {code: 0, message: ''};
    mockRequest.on = jest.fn().mockImplementation((event, func) => {
      if('error' === event) {
        errorFunction = func;
        return;
      }

      readyFunction = func;
    });
    mockResponse = new responseMock(mockRequest);
    new Server({}, mockApplication);

    requestHandler(mockRequest, mockResponse);
  });

  it('catches request errors', (done) => {
    mockRequest.error.code    = 9001;
    mockRequest.error.message = 'Just a test';

    (mockResponse.end as jest.Mock).mockImplementation(() => {
      expect(mockResponse.statusCode).toBe(mockRequest.error.code);
      expect(mockResponse.body).toEqual({ message: mockRequest.error.message });
      expect(mockResponse.end).toHaveBeenCalledTimes(1);
      done();
    });

    errorFunction();
  });

  it('should route requests', async () => {
    (mockApplication.pluginManager.route as jest.Mock).mockImplementation(async () => {
      return true;
    });

    await readyFunction();

    expect(mockApplication.pluginManager.route).toHaveBeenCalledTimes(1);
    expect(mockApplication.pluginManager.route).toHaveBeenNthCalledWith(1, mockRequest, mockResponse);

    expect(mockResponse.end).toHaveBeenCalledTimes(1);
  });

  it('should 404 properly', async () => {
    (mockApplication.pluginManager.route as jest.Mock).mockImplementation(async () => {
      return false;
    });

    await readyFunction();

    expect(mockApplication.pluginManager.route).toHaveBeenCalledTimes(1);
    expect(mockApplication.pluginManager.route).toHaveBeenNthCalledWith(1, mockRequest, mockResponse);

    expect(mockResponse.statusCode).toBe(HTTPConstants.STATUS.NOT_FOUND);
    expect(mockResponse.body).toEqual({ message: 'Not found.' });

    expect(mockResponse.end).toHaveBeenCalledTimes(1);
  });
});