jest.mock('http');
jest.mock('https');
jest.mock('../../../../src/lib/rest/request');
jest.mock('../../../../src/lib/rest/response');
jest.mock('net');

import Server   from '../../../../src/lib/rest/server';
import Enviro from '../../../../src/lib/types';

describe('Enviro.REST.ServerStatic::buildConfigObject', () => {
  it('should build a default config object', () => {
    const config: Enviro.REST.Config = Server.buildConfigObject({});

    expect(config.certificate).toBe('');
    expect(config.key).toBe('');
    expect(config.maxBodySize).toBe(Math.pow(10, 6));
    expect(config.port).toBe(80);
    expect(config.settingsSectionSeparator).toBe('>');
  });

  it('should not write over supplied config values', () => {
    const suppliedConfig: Partial<Enviro.REST.Config> = {
      certificate: 'certFile',
      maxBodySize: 9001,
      settingsSectionSeparator: '#'
    };
    const config: Enviro.REST.Config = Server.buildConfigObject(suppliedConfig);

    expect(config.certificate).toBe('certFile');
    expect(config.key).toBe('');
    expect(config.maxBodySize).toBe(9001);
    expect(config.port).toBe(80);
    expect(config.settingsSectionSeparator).toBe('#');
  });

  it('allows a 0 port', () => {
    const config: Enviro.REST.Config = Server.buildConfigObject({port: 0});

    expect(config.port).toBe(0);
  })
});