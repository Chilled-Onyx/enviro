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
import httpMock     from 'http';
import httpsMock    from 'https';

describe('Enviro.REST.Server::constructor', () => {
  let testServer: Enviro.REST.Server;
  let mockApplication: Enviro.Application;

  beforeEach(() => {
    mockApplication = new Application({startup: {display: {banner: false}}});
    mockApplication.logger = {log: jest.fn()} as unknown as Enviro.Logging.Logger;
  });

  it('it builds a config object', () => {
    testServer = new Server({}, mockApplication);

    expect(testServer.config).toStrictEqual(Server.buildConfigObject({}));
  });

  it('creates a server (http)', () => {
    testServer = new Server({}, mockApplication);

    expect(httpMock.createServer).toHaveBeenCalledTimes(1);
    expect(httpMock.createServer).toHaveBeenNthCalledWith(1,
      {IncomingMessage: requestMock, ServerResponse: responseMock},
      expect.any(Function)
    );
  });

  it('creates a server (https)', () => {
    testServer = new Server({certificate: '1', key: '1'}, mockApplication);

    expect(httpsMock.createServer).toHaveBeenCalledTimes(1);
    expect(httpsMock.createServer).toHaveBeenNthCalledWith(1,
      {IncomingMessage: requestMock, ServerResponse: responseMock, cert: '1', key: '1'},
      expect.any(Function)
    );
  });

  it('should set requests max body size', () => {
    testServer = new Server({maxBodySize: 9001}, mockApplication);
    expect((requestMock as unknown as Enviro.REST.RequestStatic).MAX_BODY_SIZE)
      .toBe(9001);
  });

  it('should set the section separator on request', () => {
    testServer = new Server({settingsSectionSeparator: '^'}, mockApplication);
    expect((requestMock as unknown as Enviro.REST.RequestStatic).SECTION_SEPARATOR)
      .toBe('^');
  });
});