jest.mock('http');
jest.mock('https');
jest.mock('../../../../src/lib/application');
jest.mock('../../../../src/lib/rest/request');
jest.mock('../../../../src/lib/rest/response');
jest.mock('net');

import Enviro from '../../../../src/lib/types';
import Application from '../../../../src/lib/application';
import Server   from '../../../../src/lib/rest/server';
import httpMock from 'http';

const serverMock = {listen: jest.fn(), address: jest.fn(), listening: false};

describe('Enviro.REST.Server::start', () => {
  let testServer: Enviro.REST.Server;
  let mockApplication: Enviro.Application;

  beforeEach(() => {
    mockApplication = new Application({startup: {display: {banner: false}}});
    jest.spyOn(httpMock, 'createServer').mockReturnValue(serverMock as unknown as httpMock.Server);
  });

  it('starts the http server', () => {
    testServer = new Server({port: 9001}, mockApplication);

    expect(testServer.start()).toBe(testServer);
    expect(serverMock.listen).toHaveBeenCalledTimes(1);
    expect(serverMock.listen).toHaveBeenNthCalledWith(1, 9001);
  });

  it('should update the port after server start if config port is 0', () => {
    serverMock.address.mockReturnValue({port: 9002});
    testServer = new Server({port: 0}, mockApplication);

    testServer.start();

    expect(testServer.config.port).toBe(9002);
  });

  it('no-ops start if the server is already listening', () => {
    serverMock.listening = true;
    testServer = new Server({}, mockApplication);

    expect(testServer.start()).toBe(testServer);
    expect(serverMock.listen).not.toHaveBeenCalled();
  });
});