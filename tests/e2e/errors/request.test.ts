import testApp, { TestResponse } from '../helper';

describe('Errors in client request', () => {
  afterAll(testApp.afterAll);
  beforeAll(testApp.beforeAll);

  it('Request body too large', async () => {
    const body = {
      test: ' '.repeat(1024)
    }
    const testResponse: TestResponse = await testApp.getResponseObject('/requestErrorBodyTooLarge', {
      method: 'POST',
      body:   JSON.stringify(body)
    });

    expect(testResponse.response.status).toBe(419);
    expect(testResponse.json.message).toBe('Request body is larger than the 1024 byte limit.');
  });

  it('Unsupported media type', async () => {
    const testResponse: TestResponse = await testApp.getResponseObject('/requestErrorWrongContentType', {
      method: 'POST',
      headers: {'content-type': 'plain/text'},
      body:   JSON.stringify({test: true})
    });

    expect(testResponse.response.status).toBe(415);
    expect(testResponse.json.message).toBe('Request content type is invalid. This server only processes application/json. \'plain/text\' supplied.');
  });

  it('Unsupported accept type', async () => {
    const testResponse: TestResponse = await testApp.getResponseObject('/requestErrorWrongAcceptType', {
      headers: {accept: 'plain/text'}
    });

    expect(testResponse.response.status).toBe(406);
    expect(testResponse.json.message).toBe('Request accept type is invalid. This server only produces \'application/json\'. \'plain/text\' requested.');
  });

  it('Invalid body data', async () => {
    const testResponse: TestResponse = await testApp.getResponseObject('/requestErrorBodySyntaxError', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body:   '{"test": error'
    });

    expect(testResponse.response.status).toBe(400);
    expect(testResponse.json.message).toBe('Request body is not valid JSON.');
  });
});