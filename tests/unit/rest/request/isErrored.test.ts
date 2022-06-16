jest.mock('http');

import Enviro from '../../../../src/lib/types';
import Request  from '../../../../src/lib/rest/request';

describe('Enviro.REST.Request::isErrored', () => {
  const blankSocket: Enviro.NodeSocket = {} as Enviro.NodeSocket;
  let testRequest: Enviro.REST.Request;

  beforeEach(() => {
    testRequest = new Request(blankSocket);
  });

  it('checks if a request has an error', () => {
    // Default
    expect(testRequest.isErrored()).toBe(false);

    // Errored
    testRequest.error.code = 400;
    expect(testRequest.isErrored()).toBe(true);
  });
});