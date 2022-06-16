import Logger from './lib/logging/logger';
import Enviro from './lib/types';

const config: Enviro.Config = {
  http: {
    certificate: '',
    key: '',
    maxBodySize: 10,
    port: 80,
    settingsSectionSeparator: '>'
  },
  log: {
    level: Logger.ACCESS_LEVEL.WARNING,
    formatted: false
  },
  plugins: [],
  startup: {
    display: {
      banner: true,
      config: true
    }
  },
  storage: {
    name: './storage/jsonFile',
    options: {
      path: './storage'
    }
  }
};

export default config;