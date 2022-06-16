jest.mock('../../../../../../src/lib/helpers');

import RouteUpdateSettings from '../../../../../../src/lib/plugins/plugin/route/updateSettings';
import Enviro from '../../../../../../src/lib/types';
import HTTPConstants from '../../../../../../src/lib/rest/httpConstants';
import * as helpersMock from '../../../../../../src/lib/helpers';

describe('Enviro.Plugins.Plugin.Route.UpdateSettings::route', () => {
  const mockEnviro = {
    pluginManager: {
      processSettings: jest.fn()
    },
    storage: {
      read: jest.fn(),
      write: jest.fn(),
      delete: jest.fn()
    },
    logger: {
      log: jest.fn()
    }
  } as unknown as Enviro.Application;

  const mockRequest  = {
    body: {parsed: {test: 1}},
    method: HTTPConstants.METHOD.PATCH,
    settings: {name: 'testSettings', section: ''}
  } as unknown as Enviro.REST.Request;

  const mockResponse = {
    body: {},
    statusCode: 0
  } as unknown as Enviro.REST.Response;
  let testPlugin: RouteUpdateSettings;

  beforeEach(() => {
    testPlugin = new RouteUpdateSettings({
      enviro: mockEnviro
    });

    mockRequest.body    = {raw: '', parsed: {test: 1}};
    mockRequest.method   = HTTPConstants.METHOD.PATCH;
    mockRequest.settings = {name: 'testSettings', section: '', raw: false};

    mockResponse.statusCode = 0;
  });

  it('should fail unless the request has a settings name', async () => {
    mockRequest.method = HTTPConstants.METHOD.GET;

    expect(await testPlugin.route(mockRequest, mockResponse)).toBe(false);
  });

  it('should fail if there is no settings name', async () => {
    mockRequest.settings.name = '';

    expect(await testPlugin.route(mockRequest, mockResponse)).toBe(false);
  });

  it('should error if no body is provided', async () => {
    mockRequest.body = {raw: '', parsed: {}};

    expect(await testPlugin.route(mockRequest, mockResponse)).toBe(true);

    expect(mockResponse.statusCode).toBe(HTTPConstants.STATUS.BAD_REQUEST);
    expect(mockResponse.body).toEqual({ message: 'No content provided for update.' });
  });

  it('should 404 if settings are not found', async () => {
    jest.spyOn(mockEnviro.storage, 'read').mockImplementation(() => {throw '';});

    expect(await testPlugin.route(mockRequest, mockResponse)).toBe(true);

    expect(mockResponse.statusCode).toBe(HTTPConstants.STATUS.NOT_FOUND);
    expect(mockEnviro.storage.read).toHaveBeenCalledTimes(1);
    expect(mockEnviro.storage.read).toHaveBeenNthCalledWith(1, mockRequest.settings.name);
  });

  it('should 500 if there is an error writing settings', async () => {
    const mergeReturnVal = {test: true};
    const readReturnVal  = {test: true};
    jest.spyOn(helpersMock, 'deepMerge').mockReturnValueOnce(mergeReturnVal);
    jest.spyOn(mockEnviro.storage, 'read').mockImplementation(async () => (readReturnVal));
    jest.spyOn(mockEnviro.storage, 'write').mockImplementation(() => {throw '';});

    expect(await testPlugin.route(mockRequest, mockResponse)).toBe(true);

    expect(mockResponse.statusCode).toBe(HTTPConstants.STATUS.INTERNAL_SERVER_ERROR);
    expect(mockResponse.body).toEqual({ message: 'An unexpected error has occurred.' });

    expect(helpersMock.deepMerge).toHaveBeenCalledTimes(1);
    expect(helpersMock.deepMerge).toHaveBeenNthCalledWith(1, readReturnVal, mockRequest.body.parsed);
    expect(mockEnviro.storage.read).toHaveBeenCalledTimes(1);
    expect(mockEnviro.storage.read).toHaveBeenNthCalledWith(1, mockRequest.settings.name);
    expect(mockEnviro.storage.write).toHaveBeenCalledTimes(1);
    expect(mockEnviro.storage.write).toHaveBeenNthCalledWith(1, mockRequest.settings.name, mergeReturnVal);
  });

  it('successfully updates settings', async () => {
    const mergeReturnVal = {test: true};
    const readReturnVal  = {testTwo: true};
    jest.spyOn(helpersMock, 'deepMerge').mockReturnValueOnce(mergeReturnVal);
    jest.spyOn(mockEnviro.storage, 'read').mockImplementation(async () => (readReturnVal));

    expect(await testPlugin.route(mockRequest, mockResponse)).toBe(true);

    expect(mockResponse.statusCode).toBe(HTTPConstants.STATUS.NO_CONTENT);

    expect(helpersMock.deepMerge).toHaveBeenCalledTimes(1);
    expect(helpersMock.deepMerge).toHaveBeenNthCalledWith(1, readReturnVal, mockRequest.body.parsed);
    expect(mockEnviro.storage.read).toHaveBeenCalledTimes(1);
    expect(mockEnviro.storage.read).toHaveBeenNthCalledWith(1, mockRequest.settings.name);
    expect(mockEnviro.storage.write).toHaveBeenCalledTimes(1);
    expect(mockEnviro.storage.write).toHaveBeenNthCalledWith(1, mockRequest.settings.name, mergeReturnVal);
  });

  it('successfully replaces settings', async () => {
    mockRequest.method = HTTPConstants.METHOD.PUT;
    mockRequest.body.parsed = {testReplacement: true};

    const readReturnVal  = {testTwo: true};
    jest.spyOn(mockEnviro.storage, 'read').mockImplementation(async () => (readReturnVal));

    expect(await testPlugin.route(mockRequest, mockResponse)).toBe(true);

    expect(mockResponse.statusCode).toBe(HTTPConstants.STATUS.NO_CONTENT);

    expect(helpersMock.deepMerge).toHaveBeenCalledTimes(0);
    expect(mockEnviro.storage.read).toHaveBeenCalledTimes(1);
    expect(mockEnviro.storage.read).toHaveBeenNthCalledWith(1, mockRequest.settings.name);
    expect(mockEnviro.storage.write).toHaveBeenCalledTimes(1);
    expect(mockEnviro.storage.write).toHaveBeenNthCalledWith(1, mockRequest.settings.name, mockRequest.body.parsed);
  });
});