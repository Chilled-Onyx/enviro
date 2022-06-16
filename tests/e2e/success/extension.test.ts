import testApp, { TestResponse } from '../helper';

describe('Read - Extension', () => {
  afterAll(testApp.afterAll);
  beforeAll(testApp.beforeAll);

  it('should allow extension of objects', async () => {
    await testApp.createSettings('parent001', {from: 'parent001'});
    await testApp.createSettings('parent002', {from: 'parent002'});
    await testApp.createSettings('ext001', {_extends: 'parent001', child: {_extends: ['parent001', 'parent002']}});

    const testResponse: TestResponse = await testApp.getResponseObject('/ext001');

    expect(testResponse.response.status).toBe(200);
    expect(testResponse.json).toEqual({
      from: 'parent001',
      child: {
        from: 'parent002'
      }
    });
  });
});