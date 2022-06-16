import testApp, { TestResponse } from '../helper';

describe('Create', () => {
  afterAll(testApp.afterAll);
  beforeAll(testApp.beforeAll);

  it('should create settings', async () => {
    const body = {test: 'settings001'};
    const testResponse: TestResponse = await testApp.getResponseObject(`/${body.test}`, {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify(body)
    });

    expect(testResponse.response.status).toBe(204);
    expect(testResponse.json).toEqual(null);
  });
});