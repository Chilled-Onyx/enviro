class testPlugin {
  options;

  constructor(options) {
    this.options = options;
  }
}

class testRoutePlugin {}

jest.mock('../../../src/lib/rest/server');
jest.mock('../../../src/lib/logging/logger');
jest.mock('../../../src/lib/plugins/manager');
jest.mock('../../../src/lib/storage/jsonFile');
jest.mock('../../../src/lib/plugins/plugin/extension', () => testPlugin);
jest.mock('../../../src/lib/plugins/plugin/route/createSettings', () => testRoutePlugin);
jest.mock('../../../src/lib/plugins/plugin/route/deleteSettings', () => testRoutePlugin);
jest.mock('../../../src/lib/plugins/plugin/route/readSettings',   () => testRoutePlugin);
jest.mock('../../../src/lib/plugins/plugin/route/updateSettings', () => testRoutePlugin);
jest.mock('test-plugin', () => testPlugin, {virtual: true});
jest.mock('fs', () => {
  return {
    readFileSync: (fileName) => {
      if('banner.txt' === fileName) {
        return 'banner text';
      }

      return 'error';
    }
  };
});

import Enviro from '../../../src/lib/types';
import restMock from '../../../src/lib/rest/server';
import loggerMock from '../../../src/lib/logging/logger';
import managerMock from '../../../src/lib/plugins/manager'
import serverMock from '../../../src/lib/rest/server';
import storageMock from '../../../src/lib/storage/jsonFile';
import Application from '../../../src/lib/application';
import fsMock      from 'fs';

describe('Enviro.Application::constructor', () => {
  it('should load the config', () => {
    const httpConfigObject = {test: true} as unknown as Enviro.REST.Config;
    jest.spyOn(serverMock, 'buildConfigObject').mockReturnValue(httpConfigObject);
    const configObject     = Application.buildConfigObject({});

    const application = new Application();

    expect(application.config).toStrictEqual(configObject);
  });

  it('should load the logger', () => {
    const httpConfigObject = {test: true} as unknown as Enviro.REST.Config;
    jest.spyOn(serverMock, 'buildConfigObject').mockReturnValue(httpConfigObject);
    const configObject     = Application.buildConfigObject({startup: {display: {banner: false}}});

    new Application({startup: {display: {banner: false}}});

    expect(loggerMock.prototype.constructor).toHaveBeenCalledTimes(1);
    expect(loggerMock.prototype.constructor).toHaveBeenNthCalledWith(1, configObject.log.level, configObject.log.formatted);
  });

  it('should load the rest server', () => {
    const httpConfigObject = {test: true} as unknown as Enviro.REST.Config;
    jest.spyOn(serverMock, 'buildConfigObject').mockReturnValue(httpConfigObject);
    const configObject     = Application.buildConfigObject({startup: {display: {banner: false}}});

    const app = new Application({startup: {display: {banner: false}}});

    expect(restMock.prototype.constructor).toHaveBeenCalledTimes(1);
    expect(restMock.prototype.constructor).toHaveBeenNthCalledWith(1, configObject.http, app);
  });

  it('should load the plugin manager', () => {
    const httpConfigObject = {test: true} as unknown as Enviro.REST.Config;
    jest.spyOn(serverMock, 'buildConfigObject').mockReturnValue(httpConfigObject);

    new Application({startup: {display: {banner: false}}});

    expect(managerMock.prototype.constructor).toHaveBeenCalledTimes(1);
    expect(managerMock.prototype.constructor).toHaveBeenNthCalledWith(1);
  });

  it('should load the storage', (done) => {
    const httpConfigObject = {test: true} as unknown as Enviro.REST.Config;
    jest.spyOn(serverMock, 'buildConfigObject').mockReturnValue(httpConfigObject);
    const configObject     = Application.buildConfigObject({startup: {display: {banner: false}}});

    const application = new Application({startup: {display: {banner: false}}});

    application.on('_storageReady', () => {
      expect(storageMock.prototype.constructor).toHaveBeenCalledTimes(1);
      expect(storageMock.prototype.constructor).toHaveBeenNthCalledWith(1, configObject.storage.options, application);
      done();
    });
  });

  it('should emit ready with no plugins', (done) => {
    const httpConfigObject = {test: true} as unknown as Enviro.REST.Config;
    jest.spyOn(serverMock, 'buildConfigObject').mockReturnValue(httpConfigObject);

    const application = new Application({startup: {display: {banner: false}}});

    application.on('ready', () => {
      expect(managerMock.prototype.addPlugin).toHaveBeenCalledTimes(5);
      expect(managerMock.prototype.addPlugin).toHaveBeenNthCalledWith(1, expect.any(testPlugin));
      expect(managerMock.prototype.addPlugin).toHaveBeenNthCalledWith(2, expect.any(testRoutePlugin));
      expect(managerMock.prototype.addPlugin).toHaveBeenNthCalledWith(3, expect.any(testRoutePlugin));
      expect(managerMock.prototype.addPlugin).toHaveBeenNthCalledWith(4, expect.any(testRoutePlugin));
      expect(managerMock.prototype.addPlugin).toHaveBeenNthCalledWith(5, expect.any(testRoutePlugin));
      done();
    });
  });

  it('should loads plugins including defaults', (done) => {
    const httpConfigObject = {test: true} as unknown as Enviro.REST.Config;
    jest.spyOn(serverMock, 'buildConfigObject').mockReturnValue(httpConfigObject);

    const application = new Application({
      plugins: [{name: 'test-plugin', options: {test: true}}],
      startup: {display: {banner: false}}
    });

    application.on('ready', () => {
      expect(managerMock.prototype.addPlugin).toHaveBeenCalledTimes(6);
      expect(managerMock.prototype.addPlugin).toHaveBeenNthCalledWith(1, expect.any(testPlugin));
      expect(managerMock.prototype.addPlugin).toHaveBeenNthCalledWith(2, expect.any(testPlugin));
      expect(managerMock.prototype.addPlugin).toHaveBeenNthCalledWith(3, expect.any(testRoutePlugin));
      expect(managerMock.prototype.addPlugin).toHaveBeenNthCalledWith(4, expect.any(testRoutePlugin));
      expect(managerMock.prototype.addPlugin).toHaveBeenNthCalledWith(5, expect.any(testRoutePlugin));
      expect(managerMock.prototype.addPlugin).toHaveBeenNthCalledWith(6, expect.any(testRoutePlugin));
      expect(managerMock.prototype.addPlugin.mock.calls[0][0].options.enviro).toBe(application);
      done();
    });
  });

  it('should display banner text', () => {
    jest.spyOn(process.stdout, 'write');

    new Application({startup: {display: {banner: true}}});

    expect(process.stdout.write).toHaveBeenCalledTimes(1);
    expect(process.stdout.write).toHaveBeenNthCalledWith(1, 'banner text');
  });

it('should display banner text (dist)', () => {
    jest.spyOn(process.stdout, 'write');
    jest.spyOn(fsMock, 'readFileSync').mockImplementation((filename): string => {
      if(filename === 'banner.txt') {
        throw 'error';
      }

      if(filename === 'dist/banner.txt') {
        return 'dist banner';
      }

      throw 'error';
    });

    new Application({startup: {display: {banner: true}}});

    expect(process.stdout.write).toHaveBeenCalledTimes(1);
    expect(process.stdout.write).toHaveBeenNthCalledWith(1, 'dist banner');
  });
});