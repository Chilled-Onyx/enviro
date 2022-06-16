jest.mock('http');

import Enviro from '../../../../src/lib/types';
import Request  from '../../../../src/lib/rest/request';

describe('Enviro.REST.Request::getClientInformation', () => {
  const blankSocket: Enviro.NodeSocket = {} as Enviro.NodeSocket;
  let testRequest: Enviro.REST.Request;

  beforeEach(() => {
    testRequest = new Request(blankSocket);
  });

  it('should build client information', () => {
    testRequest.headers = {
      'x-forwarded-for': '127.0.0.1',
      'user-agent': 'jest-test'
    };
    testRequest.url = '/jest/test';
    testRequest.method = 'POST';

    expect(testRequest.getClientInformation()).toEqual({
      headers: testRequest.headers,
      ip: '127.0.0.1',
      method: 'POST',
      url: '/jest/test',
      userAgent: 'jest-test'
    });
  });

  it('should send IP if the forwarded for is not set', () => {
    testRequest.socket = blankSocket;
    testRequest.headers = {};

    /** @ts-expect-error: this property is read only */
    blankSocket.remoteAddress = '127.0.0.2';

    expect(testRequest.getClientInformation().ip).toBe('127.0.0.2');
  });
});