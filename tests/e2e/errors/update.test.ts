import testApp, { TestResponse } from '../helper';

describe('Errors in settings updating', () => {
  afterAll(testApp.afterAll);
  beforeAll(testApp.beforeAll);

  it('no body content', async () => {
    const testResponse: TestResponse = await testApp.getResponseObject('/updateErrorNoBody', {
      method: 'PATCH',
      headers: {'content-type': 'application/json'}
    });

    expect(testResponse.response.status).toBe(400);
    expect(testResponse.json.message).toBe('No content provided for update.');
  });

  it('non existent', async () => {
    const testResponse: TestResponse = await testApp.getResponseObject('/updateErrorNonExistent', {
      method: 'PATCH',
      headers: {'content-type': 'application/json'},
      body: '{"test": true}'
    });

    expect(testResponse.response.status).toBe(404);
    expect(testResponse.json.message).toBe('updateErrorNonExistent not found.');
  });
});