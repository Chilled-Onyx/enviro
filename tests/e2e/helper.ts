import Enviro from '../../src/lib/application';
import EnviroTypes from '../../src/lib/types';
import { rm, mkdir } from 'fs/promises';

const storagePath = './tmp/storage';

const enviro = new Enviro({
  http: {
    port: 0,
    maxBodySize: 1024
  },
  log: {
    level: 0
  },
  storage: {
    options: {path: storagePath}
  },
  startup: {
    display: {
      banner: false,
      config: false
    }
  }
});

const testApp = {
  enviro,
  getResponseObject: async (url: string, options: RequestInit = {}) => {
    url = testApp.getUrl(url);
    const response: Response = await fetch(url, options);
    let json: EnviroTypes.KeyValueStore|null = null;

    try {
      json = await response.json();
    } catch {/**  */}

    return { response, json };
  },
  getUrl: (addition: string): string => {
    return `http://localhost:${enviro.rest.config.port}${addition}`;
  },
  resetStorage: async () => {
    await rm(storagePath, { recursive:true });
  },
  afterAll: async () => {
    await testApp.resetStorage();
    enviro.rest.stop();
  },
  beforeAll: async () => {
    await mkdir(storagePath, { recursive: true });
    enviro.rest.start();
  },
  createSettings: async (name: string, body: EnviroTypes.KeyValueStore) => {
    const response: TestResponse = await testApp.getResponseObject(`/${name}`, {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify(body)
    });

    if(response.response.status !== 204) {
      console.log(response);
      throw 'Error occurred while creating settings file.';
    }
  }
};

export default testApp;

/**
 * Types
 */
export type TestResponse = {
  response: Response,
  json: EnviroTypes.KeyValueStore|null
};