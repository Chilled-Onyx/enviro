import Manager from '../../../../src/lib/plugins/manager';
import Enviro from '../../../../src/lib/types';

describe('Enviro.Plugins.Manager::route', () => {
  let blankRequest: Enviro.REST.Request;
  let blankResponse: Enviro.REST.Response;
  let testManager: Enviro.Plugins.Manager;

  beforeEach(() => {
    blankRequest = {} as Enviro.REST.Request;
    blankResponse = {} as Enviro.REST.Response;
    testManager = new Manager();
  });

  it('returns false by default', async () => {
    expect(await testManager.route(blankRequest, blankResponse)).toBe(false);
  });

  it('calls plugins with route function', async () => {
    const routePluginOne: Enviro.Plugins.Plugin = {route: jest.fn().mockReturnValue(true)} as unknown as Enviro.Plugins.Plugin;
    testManager.addPlugin(routePluginOne);

    expect(await testManager.route(blankRequest, blankResponse)).toBe(true);
    expect(routePluginOne.route).toHaveBeenCalledTimes(1);
    expect(routePluginOne.route).toHaveBeenNthCalledWith(1, blankRequest, blankResponse);
  });

  it('should stop trying to route once routed', async () => {
    const routePluginOne: Enviro.Plugins.Plugin = {route: jest.fn().mockReturnValue(false)} as unknown as Enviro.Plugins.Plugin;
    const routePluginTwo: Enviro.Plugins.Plugin = {route: jest.fn().mockReturnValue(true)} as unknown as Enviro.Plugins.Plugin;
    const routePluginThree: Enviro.Plugins.Plugin = {route: jest.fn().mockReturnValue(false)} as unknown as Enviro.Plugins.Plugin;
    testManager.addPlugin(routePluginOne);
    testManager.addPlugin(routePluginTwo);
    testManager.addPlugin(routePluginThree);

    expect(await testManager.route(blankRequest, blankResponse)).toBe(true);
    expect(routePluginOne.route).toHaveBeenCalledTimes(1);
    expect(routePluginOne.route).toHaveBeenNthCalledWith(1, blankRequest, blankResponse);
    expect(routePluginTwo.route).toHaveBeenCalledTimes(1);
    expect(routePluginTwo.route).toHaveBeenNthCalledWith(1, blankRequest, blankResponse);
    expect(routePluginThree.route).not.toHaveBeenCalled();
  });
});