import RouteDeleteSettings from '../../../../../../src/lib/plugins/plugin/route/deleteSettings';
import Enviro from '../../../../../../src/lib/types';
import HTTPConstants from '../../../../../../src/lib/rest/httpConstants';

describe('Enviro.Plugins.Plugin.Route.DeleteSettings::route', () => {
  const mockEnviro = {
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
    method: HTTPConstants.METHOD.DELETE,
    settings: {name: 'testSettings', section: ''}
  } as unknown as Enviro.REST.Request;

  const mockResponse = {
    body: {},
    statusCode: 0
  } as unknown as Enviro.REST.Response;
  let testPlugin: RouteDeleteSettings;

  beforeEach(() => {
    testPlugin = new RouteDeleteSettings({
      enviro: mockEnviro
    });

    mockResponse.body    = {parsed: {test: 1}};
    mockRequest.method   = HTTPConstants.METHOD.DELETE;
    mockRequest.settings = {name: 'testSettings', section: '', raw: false};

    mockResponse.statusCode = 0;
  });

  it('should fail unless the request has a settings name', async () => {
    mockRequest.method = HTTPConstants.METHOD.POST;

    expect(await testPlugin.route(mockRequest, mockResponse)).toBe(false);
  });

  it('should fail if there is no settings name', async () => {
    mockRequest.settings.name = '';

    expect(await testPlugin.route(mockRequest, mockResponse)).toBe(false);
  });

  it('should error if settings aleady exists', async () => {
    jest.spyOn(mockEnviro.storage, 'read').mockImplementation(() => {throw '';});

    expect(await testPlugin.route(mockRequest, mockResponse)).toBe(true);

    expect(mockResponse.statusCode).toBe(HTTPConstants.STATUS.NOT_FOUND);
    expect(mockResponse.body).toEqual({message: `testSettings does not exist.`});

    expect(mockEnviro.storage.read).toHaveBeenCalledTimes(1);
    expect(mockEnviro.storage.read).toHaveBeenNthCalledWith(1, mockRequest.settings.name);
  });

  it('should error if there is an isssue deleting the file', async () => {
    jest.spyOn(mockEnviro.storage, 'delete').mockImplementation(() => {throw '';});

    expect(await testPlugin.route(mockRequest, mockResponse)).toBe(true);

    expect(mockResponse.statusCode).toBe(HTTPConstants.STATUS.INTERNAL_SERVER_ERROR);
    expect(mockResponse.body).toEqual({message: `An unexpected error has occurred.`});

    expect(mockEnviro.storage.read).toHaveBeenCalledTimes(1);
    expect(mockEnviro.storage.read).toHaveBeenNthCalledWith(1, mockRequest.settings.name);
    expect(mockEnviro.storage.delete).toHaveBeenCalledTimes(1);
    expect(mockEnviro.storage.delete).toHaveBeenNthCalledWith(1, mockRequest.settings.name);
  });

  it('should delete file', async () => {
    expect(await testPlugin.route(mockRequest, mockResponse)).toBe(true);

    expect(mockResponse.statusCode).toBe(HTTPConstants.STATUS.NO_CONTENT);

    expect(mockEnviro.storage.read).toHaveBeenCalledTimes(1);
    expect(mockEnviro.storage.read).toHaveBeenNthCalledWith(1, mockRequest.settings.name);
    expect(mockEnviro.storage.delete).toHaveBeenCalledTimes(1);
    expect(mockEnviro.storage.delete).toHaveBeenNthCalledWith(1, mockRequest.settings.name);
  });
});