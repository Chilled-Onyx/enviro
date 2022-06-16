jest.mock('../../../src/lib/rest/server');

import Enviro from '../../../src/lib/types';
import serverMock from '../../../src/lib/rest/server';
import Application from '../../../src/lib/application';

const defaultHttpConfigReturnSetup = (): Enviro.REST.Config => {
  const serverConfigObject: Enviro.REST.Config = {
    port: Math.floor(Math.random() * 10000) + 1,
    key: '',
    certificate: '',
    maxBodySize: Math.floor(Math.random() * 10000) + 1,
    settingsSectionSeparator: '>'
  };

  jest.spyOn(serverMock, 'buildConfigObject').mockReturnValue(serverConfigObject);

  return serverConfigObject;
};

describe('Enviro.ApplicationStatic::buildConfigObject', () => {
  beforeEach(() => {
    defaultHttpConfigReturnSetup();
  });

  it('fully builds the config object with defaults', () => {
    const serverConfigObject = defaultHttpConfigReturnSetup();

    const config = Application.buildConfigObject({});

    expect(serverMock.buildConfigObject).toHaveBeenCalledTimes(1);
    expect(serverMock.buildConfigObject).toHaveBeenNthCalledWith(1, {});
    expect(config.http).toBe(serverConfigObject);
    expect(config.storage).toEqual({name: './storage/jsonFile', options: {}});
    expect(config.plugins.length).toEqual(5);
    expect(config.startup).toEqual({display: {banner: true, config: true}});
    expect(config.log.level).toBe(20);
    expect(config.log.formatted).toBe(false);
  });

  it('should pass along the supplied http value', () => {
    const http: Partial<Enviro.REST.Config> = {port: 175};

    Application.buildConfigObject({http});

    expect(serverMock.buildConfigObject).toHaveBeenCalledTimes(1);
    expect(serverMock.buildConfigObject).toHaveBeenNthCalledWith(1, http);
  });

  it('should convert storage string to NameAndOptionsStore', () => {
    expect(Application.buildConfigObject({storage: 'testStorage'}).storage)
      .toEqual({name: 'testStorage', options: {}});
  });

  it('adds options to storage when none are supplied', () => {
    expect(Application.buildConfigObject({storage: {name: 'testStorage'}}).storage.options)
      .toEqual({});
  });

  it('loads the default plugins', () => {
    const plugins: Enviro.NameAndOptionsStore[] = Application.buildConfigObject({}).plugins;

    expect(plugins.length).toBe(5);
    expect(plugins[0]).toEqual({name: './plugins/plugin/extension', options: {}});
    expect(plugins[1]).toEqual({name: './plugins/plugin/route/createSettings', options: {}});
    expect(plugins[2]).toEqual({name: './plugins/plugin/route/deleteSettings', options: {}});
    expect(plugins[3]).toEqual({name: './plugins/plugin/route/readSettings', options: {}});
    expect(plugins[4]).toEqual({name: './plugins/plugin/route/updateSettings', options: {}});
  });

  it('should convert plugin strings to NameAndOptionsStores', () => {
    const input: Partial<Enviro.ConfigPrebuild> = {plugins: ['testPlugin']}
    const plugins: Enviro.NameAndOptionsStore[] = Application.buildConfigObject(input).plugins;

    expect(plugins.length).toBe(6);
    expect(plugins[0]).toEqual({name: 'testPlugin', options: {}});
  });

  it('should add options to a plugin object that does not have it', () => {
    const input: Partial<Enviro.ConfigPrebuild> = {plugins: [{name: 'testPlugin'}]}
    const plugins: Enviro.NameAndOptionsStore[] = Application.buildConfigObject(input).plugins;

    expect(plugins.length).toBe(6);
    expect(plugins[0]).toEqual({name: 'testPlugin', options: {}});
  });

  it('should build out the startup display options if not provided', () => {
    expect(Application.buildConfigObject({startup: {}}).startup.display.banner)
      .toBe(true);

    expect(Application.buildConfigObject({startup: {}}).startup.display.config)
      .toBe(true);
  });

  it('should fill in display options that are not provided', () => {
    let config = Application.buildConfigObject({startup: {display: {config: false}}});
    expect(config.startup.display.banner).toBe(true);
    expect(config.startup.display.config).toBe(false);

    config = Application.buildConfigObject({startup: {display: {banner: false}}});
    expect(config.startup.display.banner).toBe(false);
    expect(config.startup.display.config).toBe(true);
  });

  it('should add the name to storage config when only options are provided', () => {
    const config = Application.buildConfigObject({storage: {options: {path: './test/path'}}});

    expect(config.storage.name).toBe('./storage/jsonFile');
    expect(config.storage.options.path).toBe('./test/path');
  });
});