import Enviro from '../../../src/lib/types';
import testApp, { TestResponse } from '../helper';

describe('Update', () => {
  afterAll(testApp.afterAll);
  beforeAll(testApp.beforeAll);

  it('should update settings', async () => {
    const body: Enviro.KeyValueStore = {testOne: true, testTwo: true};
    await testApp.createSettings('update001', body);

    const testUpdateResponse: TestResponse = await testApp.getResponseObject('/update001', {
      method: 'PATCH',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({testTwo: false, testThree: true})
    });

    expect(testUpdateResponse.response.status).toBe(204);
    expect(testUpdateResponse.json).toBe(null);

    const testReadResponse: TestResponse = await testApp.getResponseObject('/update001');

    expect(testReadResponse.response.status).toBe(200);
    expect(testReadResponse.json).toEqual({testOne: true, testTwo: false, testThree: true});
  });

  it('should replace settings', async () => {
    const bodyOne: Enviro.KeyValueStore = {testOne: true, testTwo: true};
    const bodyTwo: Enviro.KeyValueStore = {testTwo: false, testThree: true};

    await testApp.createSettings('update002', bodyOne);

    const testUpdateResponse: TestResponse = await testApp.getResponseObject('/update002', {
      method: 'PUT',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify(bodyTwo)
    });

    expect(testUpdateResponse.response.status).toBe(204);
    expect(testUpdateResponse.json).toBe(null);

    const testReadResponse: TestResponse = await testApp.getResponseObject('/update002');

    expect(testReadResponse.response.status).toBe(200);
    expect(testReadResponse.json).toEqual(bodyTwo);
  });
});