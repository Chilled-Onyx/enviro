import testApp, { TestResponse } from '../helper';

describe('Miscellaneous errors', () => {
  afterAll(testApp.afterAll);
  beforeAll(testApp.beforeAll);

  it('should 404 with a method that is not supported', async () => {
    const testResponse: TestResponse = await testApp.getResponseObject('/test/options', {method: 'OPTIONS'});

    expect(testResponse.response.status).toBe(404);
    expect(testResponse.json.message).toBe('Not found.');
  });
});