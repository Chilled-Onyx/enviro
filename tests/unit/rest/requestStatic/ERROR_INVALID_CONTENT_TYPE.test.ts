jest.mock('http');

import Request  from '../../../../src/lib/rest/request';

describe('Enviro.REST.RequestStatic::ERROR_INVALID_CONTENT_TYPE', () => {
  it('should give an error string', () => {
    expect(Request.ERROR_INVALID_CONTENT_TYPE('jibberish'))
      .toBe('Request content type is invalid. This server only processes application/json. \'jibberish\' supplied.');
  });
});