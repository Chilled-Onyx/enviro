import { deepMerge, isObject } from '../../helpers';
import Enviro from '../../types';
import Logger from '../../logging/logger';
import PluginAbstract from './abstract';

type ExtendedSettings = Enviro.KeyValueStore & {
  _extends: string | string[]
};

class PluginExtension extends PluginAbstract {
  public async processSettings(settings: ExtendedSettings): Promise<Enviro.KeyValueStore> {
    const localSettings: ExtendedSettings = { ...settings };
    if('string' === typeof localSettings._extends) {
      localSettings._extends = [localSettings._extends];
    }
    localSettings._extends ||= [];

    let returnSettings: Enviro.KeyValueStore = {};

    for(const settingsName of localSettings._extends) {
      const tmpParts: string[] = settingsName.split(this.enviro.config.http.settingsSectionSeparator);
      const settingsParts: Enviro.REST.RequestSettingsContainer = {
        name: tmpParts[0],
        section: tmpParts[1] || '',
        raw: false
      };

      let newSettings: Enviro.KeyValueStore = await this.enviro.storage.read(settingsParts.name);

      if('' !== settingsParts.section) {
        if(undefined === newSettings[settingsParts.section]) {
          throw `Unable to find ${settingsParts.section} in ${settingsParts.name}`;
        }

        newSettings = newSettings[settingsParts.section] as Enviro.KeyValueStore;

        if(!isObject(newSettings)) {
          newSettings = {[settingsParts.section]: newSettings};
        }
      }

      returnSettings = deepMerge(returnSettings, await this.processSettings(newSettings as ExtendedSettings));
    }

    for(const child of Object.keys(settings)) {
      if(isObject(localSettings[child])) {
        localSettings[child] = await this.processSettings(localSettings[child] as ExtendedSettings);
      }
    }

    returnSettings = deepMerge(returnSettings, localSettings);

    delete returnSettings._extends;

    this.enviro.logger.log({
      group: `plugin-${this.constructor.name}-settings-processed`,
      level: Logger.ACCESS_LEVEL.DEBUG,
      extraData: {original: settings, processed: returnSettings}
    });

    return returnSettings;
  }
}

export default PluginExtension;