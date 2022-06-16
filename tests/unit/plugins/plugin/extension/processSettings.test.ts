import PluginExtension from '../../../../../src/lib/plugins/plugin/extension';
import Enviro from '../../../../../src/lib/types';

const readReturns = {
  readReturn01: {'01': 'test01'},
  readReturn02: {_extends: 'readReturn01', '02': 'test02'},
  readReturn03: {_extends: ['readReturn02>02']}
};

describe('Enviro.Plugins.Plugin.Extension::processSettings', () => {
  const mockApplication = {
    pluginManager: {
      processSettings: jest.fn()
    },
    storage: {
      read: jest.fn(),
      write: jest.fn(),
      delete: jest.fn()
    },
    logger: {
      log: jest.fn()
    },
    config: {
      http: {
        settingsSectionSeparator: '>'
      }
    }
  } as unknown as Enviro.Application;
  const testPlugin = new PluginExtension({enviro: mockApplication});

  beforeEach(() => {
    jest.spyOn(mockApplication.storage, 'read').mockImplementation((settingsName) => {
      if(undefined === readReturns[settingsName]) {
        throw 'error';
      }

      return readReturns[settingsName];
    });

    mockApplication.config.http.settingsSectionSeparator = '>';
  });

  it('just returns settings if there are no extensions to process', async () => {
    const settings: Enviro.KeyValueStore & {_extends: string[]} = {_extends: [], test: true, another: true};
    const returnVal: Enviro.KeyValueStore = {test: true, another: true};

    expect(await testPlugin.processSettings(settings)).toEqual(returnVal);
  });

  it('processes settings', async () => {
    const input = {
      _extends: ['readReturn01'],
      'deeperTest': {
        level: {_extends: 'readReturn02'}
      },
      'sectionTest': {_extends: 'readReturn03'}
    };

    const output = {
      '01': 'test01',
      'deeperTest': {
        level: {
          '02': 'test02',
          '01': 'test01'
        }
      },
      'sectionTest': {
        '02': 'test02'
      }
    };

    expect(await testPlugin.processSettings(input)).toEqual(output);
  });

  it('catches missing sections', async () => {
    const input = {_extends: 'readReturn01>notHere'};

    try {
      await testPlugin.processSettings(input);
      throw 'Expected error not thrown';
    } catch (error) {
      expect(error.toString()).toBe('Unable to find notHere in readReturn01');
    }
  });
});