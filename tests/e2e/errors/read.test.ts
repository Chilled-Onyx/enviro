import testApp, { TestResponse } from '../helper';

describe('Errors in settings reading', () => {
  afterAll(testApp.afterAll);
  beforeAll(testApp.beforeAll);

  it('Non existent read', async () => {
    const testResponse: TestResponse = await testApp.getResponseObject('/readErrorNonExistent');

    expect(testResponse.response.status).toBe(404);
    expect(testResponse.json.message).toBe('readErrorNonExistent not found.');
  });

  it('Non existent section', async () => {
    await testApp.getResponseObject('/readErrorNonExistentSection', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({testOne: {test: true}})
    });

    const testResponse: TestResponse = await testApp.getResponseObject('/readErrorNonExistentSection>testTwo');
    expect(testResponse.response.status).toBe(404);
    expect(testResponse.json.message).toBe('readErrorNonExistentSection has no testTwo subsection.');
  });
});