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

const serverMock = {close: jest.fn(), listen: jest.fn(), address: jest.fn(), listening: false};

describe('Enviro.REST.Server::stop', () => {
  let testServer: Enviro.REST.Server;
  let mockApplication: Enviro.Application;

  beforeEach(() => {
    mockApplication = new Application({startup: {display: {banner: false}}});
    testServer = undefined;
    serverMock.listening = false;
  });

  beforeEach(() => {
    jest.spyOn(httpMock, 'createServer').mockReturnValue(serverMock as unknown as httpMock.Server);
  });

  it('no-ops start if the server is already listening', () => {
    serverMock.listening = false;
    testServer = new Server({}, mockApplication);

    expect(testServer.stop()).toBe(testServer);
    expect(serverMock.close).not.toHaveBeenCalled();
  });

  it('closes the server', () => {
    serverMock.listening = true;
    testServer = new Server({}, mockApplication);

    expect(testServer.stop()).toBe(testServer);
    expect(serverMock.close).toHaveBeenCalledTimes(1);
  });
});