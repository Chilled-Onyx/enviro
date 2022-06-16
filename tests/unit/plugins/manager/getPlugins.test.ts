import Manager from '../../../../src/lib/plugins/manager';
import Enviro from '../../../../src/lib/types';

describe('Enviro.Plugins.Manager::getPlugins', () => {
  it('should allow you to get plugins', () => {
    const testManager = new Manager();
    const processSettingsPlugin = {processSettings: jest.fn()} as unknown as Enviro.Plugins.Plugin;
    const routePlugin = {route: jest.fn()} as unknown as Enviro.Plugins.Plugin;

    expect(testManager.addPlugin(processSettingsPlugin)).toBe(testManager);
    expect(testManager.addPlugin(routePlugin)).toBe(testManager);

    expect(testManager.getPlugins()).toStrictEqual([processSettingsPlugin, routePlugin]);
    expect(testManager.getPlugins('route')).toStrictEqual([routePlugin]);
    expect(testManager.getPlugins('authenticateRequest')).toStrictEqual([]);
  });
});