import RouteCreateSettings from '../../../../../../src/lib/plugins/plugin/route/createSettings';
import Enviro from '../../../../../../src/lib/types';
import HTTPConstants from '../../../../../../src/lib/rest/httpConstants';

describe('Enviro.Plugins.Plugin.Route.CreateSettings::route', () => {
  const mockEnviro = {
    storage: {
      read: jest.fn(),
      write: jest.fn()
    },
    logger: {
      log: jest.fn()
    }
  } as unknown as Enviro.Application;

  const mockRequest  = {
    body: {parsed: {test: 1}},
    method: HTTPConstants.METHOD.GET,
    settings: {name: 'testSettings', section: ''}
  } as unknown as Enviro.REST.Request;

  const mockResponse = {
    body: {},
    statusCode: 0
  } as unknown as Enviro.REST.Response;
  let testPlugin: RouteCreateSettings;

  beforeEach(() => {
    testPlugin = new RouteCreateSettings({
      enviro: mockEnviro
    });

    mockResponse.body    = {parsed: {test: 1}};
    mockRequest.method   = HTTPConstants.METHOD.POST;
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

  it('should error if settings aleady exists', async () => {
    expect(await testPlugin.route(mockRequest, mockResponse)).toBe(true);
    expect(mockResponse.statusCode).toBe(HTTPConstants.STATUS.CONFLICT);
    expect(mockResponse.body).toEqual({message: `testSettings settings already exist.`});

    expect(mockEnviro.storage.read).toHaveBeenCalledTimes(1);
    expect(mockEnviro.storage.read).toHaveBeenNthCalledWith(1, mockRequest.settings.name);
  });

  it('should error if no body is provided', async () => {
    jest.spyOn(mockEnviro.storage, 'read').mockImplementation(() => {throw '';});
    mockRequest.body.parsed = {};

    expect(await testPlugin.route(mockRequest, mockResponse)).toBe(true);
    expect(mockResponse.statusCode).toBe(HTTPConstants.STATUS.BAD_REQUEST);
    expect(mockResponse.body).toEqual({message: 'No settings content was provided.'});
  });

  it('should error if an issue happens with write', async () => {
    mockRequest.body.parsed = {test: true};
    jest.spyOn(mockEnviro.storage, 'write').mockImplementation(() => {throw '';});
    jest.spyOn(mockEnviro.storage, 'read').mockImplementation(() => {throw '';});

    expect(await testPlugin.route(mockRequest, mockResponse)).toBe(true);

    expect(mockEnviro.storage.read).toHaveBeenCalledTimes(1);
    expect(mockEnviro.storage.read).toHaveBeenNthCalledWith(1, mockRequest.settings.name);

    expect(mockEnviro.storage.write).toHaveBeenCalledTimes(1);
    expect(mockEnviro.storage.write).toHaveBeenNthCalledWith(1, mockRequest.settings.name, mockRequest.body.parsed);

    expect(mockResponse.statusCode).toBe(HTTPConstants.STATUS.INTERNAL_SERVER_ERROR);
    expect(mockResponse.body).toEqual({message: 'An unexpected error has occurred.'});
  });

  it('should successfully create settings', async () => {
    mockRequest.body.parsed = {test: true};
    jest.spyOn(mockEnviro.storage, 'read').mockImplementation(() => {throw '';});

    expect(await testPlugin.route(mockRequest, mockResponse)).toBe(true);

    expect(mockEnviro.storage.read).toHaveBeenCalledTimes(1);
    expect(mockEnviro.storage.read).toHaveBeenNthCalledWith(1, mockRequest.settings.name);

    expect(mockEnviro.storage.write).toHaveBeenCalledTimes(1);
    expect(mockEnviro.storage.write).toHaveBeenNthCalledWith(1, mockRequest.settings.name, mockRequest.body.parsed);

    expect(mockResponse.statusCode).toBe(HTTPConstants.STATUS.NO_CONTENT);
  });
});