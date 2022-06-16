import testApp, { TestResponse } from '../helper';

describe('Delete', () => {
  afterAll(testApp.afterAll);
  beforeAll(testApp.beforeAll);

  it('should delete a file', async () => {
    await testApp.createSettings('delete001', {test: true});

    const testResponse: TestResponse = await testApp.getResponseObject('/delete001', {
      method: 'DELETE'
    });

    expect(testResponse.response.status).toBe(204);
    expect(testResponse.json).toBe(null);
  });
});