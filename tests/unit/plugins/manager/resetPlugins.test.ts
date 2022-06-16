import Manager from '../../../../src/lib/plugins/manager';
import Enviro from '../../../../src/lib/types';

describe('Enviro.Plugins.Manager::resetPlugin', () => {
  it('should allow you to reset plugins', () => {
    const testManager = new Manager();
    const processSettingsPlugin = {processSettings: jest.fn()} as unknown as Enviro.Plugins.Plugin;

    expect(testManager.getPlugins().length).toBe(0);
    testManager.addPlugin(processSettingsPlugin);
    expect(testManager.getPlugins().length).toBe(1);
    expect(testManager.resetPlugins()).toBe(testManager);
    expect(testManager.getPlugins().length).toBe(0);
  });
});