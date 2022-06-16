import Manager from '../../../../src/lib/plugins/manager';
import Enviro from '../../../../src/lib/types';

describe('Enviro.Plugins.Manager::addPlugin', () => {
  it('should allow you to add a plugin', () => {
    const testManager = new Manager();

    expect(testManager.addPlugin({} as Enviro.Plugins.Plugin)).toBe(testManager);
  });
});