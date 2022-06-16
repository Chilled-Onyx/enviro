import Manager from '../../../../src/lib/plugins/manager';
import Enviro from '../../../../src/lib/types';

describe('Enviro.Plugins.Manager::authenticateRequest', () => {
  let blankRequest: Enviro.REST.Request;
  let testManager: Enviro.Plugins.Manager;

  beforeEach(() => {
    blankRequest = {} as Enviro.REST.Request;
    testManager = new Manager();
  });

  it('should return true by default', async () => {
    expect(await testManager.authenticateRequest(blankRequest)).toBe(true);
  });

  it('it should return false if the plugin does', async () => {
    const authPluginOne = {authenticateRequest: jest.fn()} as unknown as Enviro.Plugins.Plugin;
    testManager.addPlugin(authPluginOne as Enviro.Plugins.Plugin);

    jest.spyOn(authPluginOne, 'authenticateRequest').mockImplementation(async () => false);

    expect(await testManager.authenticateRequest(blankRequest)).toBe(false);
    expect(authPluginOne.authenticateRequest).toHaveBeenCalledTimes(1);
    expect(authPluginOne.authenticateRequest).toHaveBeenNthCalledWith(1, blankRequest);
  });

  it('should stop processing once a plugin returns false', async () => {
    const authPluginOne = {authenticateRequest: jest.fn()} as unknown as Enviro.Plugins.Plugin;
    const authPluginTwo = {authenticateRequest: jest.fn()} as unknown as Enviro.Plugins.Plugin;
    testManager.addPlugin(authPluginOne);
    testManager.addPlugin(authPluginTwo);

    (authPluginOne.authenticateRequest as jest.Mock).mockImplementation(async () => false);

    expect(testManager.getPlugins('authenticateRequest').length).toBe(2);
    expect(await testManager.authenticateRequest(blankRequest)).toBe(false);
    expect(authPluginOne.authenticateRequest).toHaveBeenCalledTimes(1);
    expect(authPluginOne.authenticateRequest).toHaveBeenNthCalledWith(1, blankRequest);
    expect(authPluginTwo.authenticateRequest).not.toHaveBeenCalled();
  });
});