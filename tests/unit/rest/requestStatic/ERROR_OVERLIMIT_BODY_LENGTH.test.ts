jest.mock('http');

import Request  from '../../../../src/lib/rest/request';

describe('Enviro.REST.RequestStatic::ERROR_OVER_LIMIT_BODY_LENGTH', () => {
  it('should give an error string', () => {
    Request.MAX_BODY_SIZE = 9001;

    expect(Request.ERROR_OVER_LIMIT_BODY_LENGTH())
      .toBe('Request body is larger than the 9001 byte limit.');
  });
});