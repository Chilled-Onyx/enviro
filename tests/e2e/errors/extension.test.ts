import testApp, { TestResponse } from '../helper';

describe('Read - Extension - Errors', () => {
  afterAll(testApp.afterAll);
  beforeAll(testApp.beforeAll);

  it('should error out when extending settings that do not exit', async () => {
    await testApp.createSettings('extError001', {_extends: 'parent'});

    const testResponse: TestResponse = await testApp.getResponseObject('/extError001');

    expect(testResponse.response.status).toBe(500);
    expect(testResponse.json.message).toEqual('Error processing stored settings.');
  });

  it('should error when extending a non existent settings section', async () => {
    await testApp.createSettings('extError002', {_extends: 'extError003>notHere'});
    await testApp.createSettings('extError003', {test: true});

    const testResponse: TestResponse = await testApp.getResponseObject('/extError002');

    expect(testResponse.response.status).toBe(500);
    expect(testResponse.json.message).toEqual('Error processing stored settings.');
  })
});