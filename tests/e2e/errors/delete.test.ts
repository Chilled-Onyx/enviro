import testApp, { TestResponse } from '../helper';

describe('Errors in settings deletion', () => {
  afterAll(testApp.afterAll);
  beforeAll(testApp.beforeAll);

  it('Non existent delete', async () => {
    const testResponse: TestResponse = await testApp.getResponseObject('/deletionErrorNonExistent', {
      method: 'DELETE'
    });

    expect(testResponse.response.status).toBe(404);
    expect(testResponse.json.message).toBe('deletionErrorNonExistent does not exist.');
  });
});