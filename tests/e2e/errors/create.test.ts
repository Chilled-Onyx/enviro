import testApp, { TestResponse } from '../helper';

describe('Errors in settings creation', () => {
  afterAll(testApp.afterAll);
  beforeAll(testApp.beforeAll);

  it('No body content', async () => {
    const testResponse: TestResponse = await testApp.getResponseObject('/creationErrorNoBody', {
      method: 'POST',
      headers: {'content-type': 'application/json'}
    });

    expect(testResponse.response.status).toBe(400);
    expect(testResponse.json.message).toBe('No settings content was provided.');
  });

  it('Settings already exist', async () => {
    const body = JSON.stringify({test: true});
    const options = {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body
    };
    const url = '/creationErrorAlreadyExists';
    
    await testApp.getResponseObject(url, options);
    const testResponse: TestResponse = await testApp.getResponseObject(url, options);

    expect(testResponse.response.status).toBe(409);
    expect(testResponse.json.message).toBe('creationErrorAlreadyExists settings already exist.');
  });
});