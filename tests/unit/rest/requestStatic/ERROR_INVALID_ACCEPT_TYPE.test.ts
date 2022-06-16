jest.mock('http');

import Request  from '../../../../src/lib/rest/request';

describe('Enviro.REST.RequestStatic::ERROR_INVALID_ACCEPT_TYPE', () => {
  it('should give an error string', () => {
    expect(Request.ERROR_INVALID_ACCEPT_TYPE('text/plain'))
      .toBe('Request accept type is invalid. This server only produces \'application/json\'. \'text/plain\' requested.');
  });
});