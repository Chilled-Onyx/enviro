import Enviro from '../../../src/lib/types';
import testApp, { TestResponse } from '../helper';

describe('Read', () => {
  afterAll(testApp.afterAll);
  beforeAll(testApp.beforeAll);

  it('should read settings', async () => {
    const body: Enviro.KeyValueStore = {test: true};
    await testApp.createSettings('read001', body);

    const testResponse: TestResponse = await testApp.getResponseObject('/read001');

    expect(testResponse.response.status).toBe(200);
    expect(testResponse.json).toEqual(body);
  });

  it('should read a section', async () => {
    const body: Enviro.KeyValueStore = {test: true, testTwo: {deepObject: true}};
    await testApp.createSettings('read002', body);

    const testResponse: TestResponse = await testApp.getResponseObject('/read002>testTwo');

    expect(testResponse.response.status).toBe(200);
    expect(testResponse.json).toEqual(body.testTwo);
  });

  it('should convert to an object', async () => {
    const body: Enviro.KeyValueStore = {test: true, testTwo: {deepObject: true}};
    await testApp.createSettings('read003', body);

    const testResponse: TestResponse = await testApp.getResponseObject('/read003>test');

    expect(testResponse.response.status).toBe(200);
    expect(testResponse.json).toEqual({ test: true });
  });
});