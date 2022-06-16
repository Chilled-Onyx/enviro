import RouteReadSettings from '../../../../../../src/lib/plugins/plugin/route/readSettings';
import Enviro from '../../../../../../src/lib/types';
import HTTPConstants from '../../../../../../src/lib/rest/httpConstants';

describe('Enviro.Plugins.Plugin.Route.ReadSettings::route', () => {
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
    method: HTTPConstants.METHOD.GET,
    settings: {name: 'testSettings', section: ''}
  } as unknown as Enviro.REST.Request;

  const mockResponse = {
    body: {},
    statusCode: 200
  } as unknown as Enviro.REST.Response;
  let testPlugin: RouteReadSettings;

  beforeEach(() => {
    testPlugin = new RouteReadSettings({
      enviro: mockEnviro
    });

    mockResponse.body    = {parsed: {test: 1}};
    mockRequest.method   = HTTPConstants.METHOD.GET;
    mockRequest.settings = {name: 'testSettings', section: '', raw: true};

    mockResponse.statusCode = HTTPConstants.STATUS.OKAY;
  });

  it('should fail unless the request has a settings name', async () => {
    mockRequest.method = HTTPConstants.METHOD.POST;

    expect(await testPlugin.route(mockRequest, mockResponse)).toBe(false);
  });

  it('should fail if there is no settings name', async () => {
    mockRequest.settings.name = '';

    expect(await testPlugin.route(mockRequest, mockResponse)).toBe(false);
  });

  it('should fail if settings do not exist', async () => {
    jest.spyOn(mockEnviro.storage, 'read').mockImplementation(() => {throw '';});

    expect(await testPlugin.route(mockRequest, mockResponse)).toBe(true);

    expect(mockEnviro.storage.read).toHaveBeenCalledTimes(1);
    expect(mockEnviro.storage.read).toHaveBeenNthCalledWith(1, mockRequest.settings.name);

    expect(mockResponse.statusCode).toBe(HTTPConstants.STATUS.NOT_FOUND);
    expect(mockResponse.body).toEqual({ message: 'testSettings not found.' });
  });

  it('should fail if settings subsection do not exist', async () => {
    jest.spyOn(mockEnviro.storage, 'read').mockImplementationOnce(async () => ({
      test: true
    }));
    mockRequest.settings.section = 'subSection';

    expect(await testPlugin.route(mockRequest, mockResponse)).toBe(true);

    expect(mockEnviro.storage.read).toHaveBeenCalledTimes(1);
    expect(mockEnviro.storage.read).toHaveBeenNthCalledWith(1, mockRequest.settings.name);

    expect(mockResponse.statusCode).toBe(HTTPConstants.STATUS.NOT_FOUND);
    expect(mockResponse.body).toEqual({ message: 'testSettings has no subSection subsection.' });
  });

it('should return settings with subsection', async () => {
    jest.spyOn(mockEnviro.storage, 'read').mockImplementationOnce(async () => ({
      subSection: {test: true}
    }));

    expect(await testPlugin.route(mockRequest, mockResponse)).toBe(true);

    expect(mockEnviro.storage.read).toHaveBeenCalledTimes(1);
    expect(mockEnviro.storage.read).toHaveBeenNthCalledWith(1, mockRequest.settings.name);

    expect(mockResponse.statusCode).toBe(HTTPConstants.STATUS.OKAY);
    expect(mockResponse.body).toEqual({
      subSection: {test: true}
    });
  });

  it('should return settings with subsection', async () => {
    jest.spyOn(mockEnviro.storage, 'read').mockImplementationOnce(async () => ({
      subSection: {test: true}
    }));
    mockRequest.settings.section = 'subSection';

    expect(await testPlugin.route(mockRequest, mockResponse)).toBe(true);

    expect(mockEnviro.storage.read).toHaveBeenCalledTimes(1);
    expect(mockEnviro.storage.read).toHaveBeenNthCalledWith(1, mockRequest.settings.name);

    expect(mockResponse.statusCode).toBe(HTTPConstants.STATUS.OKAY);
    expect(mockResponse.body).toEqual({ test: true });
  });

it('should return settings with subsection (convert to object)', async () => {
    jest.spyOn(mockEnviro.storage, 'read').mockImplementationOnce(async () => ({
      subSection: true
    }));
    mockRequest.settings.section = 'subSection';

    expect(await testPlugin.route(mockRequest, mockResponse)).toBe(true);

    expect(mockEnviro.storage.read).toHaveBeenCalledTimes(1);
    expect(mockEnviro.storage.read).toHaveBeenNthCalledWith(1, mockRequest.settings.name);

    expect(mockResponse.statusCode).toBe(HTTPConstants.STATUS.OKAY);
    expect(mockResponse.body).toEqual({ subSection: true });
  });

  it('feeds settings through plugins', async () => {
    const processSettingsReturn = {from: 'processSettings'};
    (mockEnviro.pluginManager.processSettings as jest.Mock).mockImplementation(async () => processSettingsReturn);
    mockRequest.settings.raw = false;

    expect(await testPlugin.route(mockRequest, mockResponse)).toBe(true);

    expect(mockEnviro.storage.read).toHaveBeenCalledTimes(1);
    expect(mockEnviro.storage.read).toHaveBeenNthCalledWith(1, mockRequest.settings.name);

    expect(mockResponse.statusCode).toBe(HTTPConstants.STATUS.OKAY);
    expect(mockResponse.body).toEqual(processSettingsReturn);
  });

  it('should fail if plugin processing fails', async () => {
    (mockEnviro.pluginManager.processSettings as jest.Mock).mockImplementation(async () => {
      throw 'error'
    });
    mockRequest.settings.raw = false;

    expect(await testPlugin.route(mockRequest, mockResponse)).toBe(true);

    expect(mockEnviro.storage.read).toHaveBeenCalledTimes(1);
    expect(mockEnviro.storage.read).toHaveBeenNthCalledWith(1, mockRequest.settings.name);

    expect(mockResponse.statusCode).toBe(HTTPConstants.STATUS.INTERNAL_SERVER_ERROR);
    expect(mockResponse.body).toEqual({ message: 'Error processing stored settings.' });
  });
});