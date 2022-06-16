jest.mock('http');

import Request  from '../../../../src/lib/rest/request';

describe('Enviro.REST.RequestStatic::ERROR_INVALID_CONTENT_SYNTAX', () => {
  it('should give an error string', () => {
    expect(Request.ERROR_INVALID_CONTENT_SYNTAX())
      .toBe('Request body is not valid JSON.');
  });
});