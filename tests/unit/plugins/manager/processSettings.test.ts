import Enviro from '../../../../src/lib/types';
import Manager from '../../../../src/lib/plugins/manager';

describe('Enviro.Plugins.Manager::processSettings', () => {
  it('should process settings', async () => {
    const returnVal   = {test: true};
    const testManager = new Manager();

    testManager.addPlugin({processSettings: async () => returnVal} as unknown as Enviro.Plugins.Plugin);

    expect(await testManager.processSettings({})).toBe(returnVal);
  });
});