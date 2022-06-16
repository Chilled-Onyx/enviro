jest.mock('http');

import Enviro      from '../../../../src/lib/types';
import Request       from '../../../../src/lib/rest/request';
import HTTPConstants from '../../../../src/lib/rest/httpConstants';
import httpMock      from 'http';

const RequestStatic: Enviro.REST.RequestStatic = Request as unknown as Enviro.REST.RequestStatic;

describe('Enviro.REST.Request::_eventHandlerEndValidator', () => {
  const blankSocket: Enviro.NodeSocket = {} as Enviro.NodeSocket;
  let testRequest: Enviro.REST.Request;
  let testDataHandler: () => void;

  afterEach(() => {
    testRequest = undefined;
    testDataHandler = undefined;
  });

  beforeEach(() => {
    jest.spyOn(httpMock.IncomingMessage.prototype, 'on').mockImplementation((event, func) => {
      if('end' === event && testDataHandler === undefined) {
        testDataHandler = func;
      }
      
      return null as httpMock.IncomingMessage;
    });
    httpMock.IncomingMessage.prototype.headers = {
      accept: HTTPConstants.CONTENT_TYPE.ALL,
      'content-type': HTTPConstants.CONTENT_TYPE.JSON
    };

    testRequest = new Request(blankSocket);
    testRequest.body.raw = '{"test": true}';
    RequestStatic.SECTION_SEPARATOR = '>';
  });

  it('should no-op if the request is already errored', () => {
    testRequest.error.code = 1;

    testDataHandler();

    expect(httpMock.IncomingMessage.prototype.emit).toHaveBeenCalledTimes(0);
  });

  it('should invalidate content-type when none is provided', () => {
    httpMock.IncomingMessage.prototype.headers = {};
    testDataHandler();

    expect(testRequest.error.code).toBe(HTTPConstants.STATUS.UNSUPPORTED_MEDIA_TYPE);
    expect(testRequest.error.message).toBe(RequestStatic.ERROR_INVALID_CONTENT_TYPE(''));
    expect(httpMock.IncomingMessage.prototype.emit).toHaveBeenCalledTimes(0);
  });

  it('should invalidate content-type when an incorrect one is provided', () => {
    const dataType = 'text/plain';
    testRequest.headers['content-type'] = 'text/plain';

    testDataHandler();

    expect(testRequest.error.code).toBe(HTTPConstants.STATUS.UNSUPPORTED_MEDIA_TYPE);
    expect(testRequest.error.message).toBe(RequestStatic.ERROR_INVALID_CONTENT_TYPE(dataType));
    expect(httpMock.IncomingMessage.prototype.emit).toHaveBeenCalledTimes(0);
  });

  it('should validate proper content-type', () => {
    testDataHandler();

    expect(testRequest.error.code).toBe(0);
    expect(testRequest.error.message).toBe('');
  });

  it('defaults to an all type if no accept type is provided', () => {
    delete httpMock.IncomingMessage.prototype.headers.accept;

    testDataHandler();

    expect(testRequest.error.code).toBe(0);
    expect(testRequest.error.message).toBe('');
  });

  it('strips content type paramaters', () => {
    httpMock.IncomingMessage.prototype.headers.accept = 'application/json;q=.5';

    testDataHandler();

    expect(testRequest.error.code).toBe(0);
    expect(testRequest.error.message).toBe('');
  });

  it('invalidates if no suitable type is provided', () => {
    httpMock.IncomingMessage.prototype.headers.accept = 'plain/text';

    testDataHandler();

    expect(testRequest.error.code).toBe(HTTPConstants.STATUS.NOT_ACCEPTABLE);
    expect(testRequest.error.message).toBe(RequestStatic.ERROR_INVALID_ACCEPT_TYPE('plain/text'));
    expect(httpMock.IncomingMessage.prototype.emit).toHaveBeenCalledTimes(0);
  });

  it('it provides blank names if no url is provided', () => {
    testDataHandler();

    expect(testRequest.settings.name).toBe('');
    expect(testRequest.settings.section).toBe('');
  });

  it('parses the settings name', () => {
    const settingsName = 'requestTestSettingsNameParsing' 
    testRequest.url = `/${settingsName}`;

    testDataHandler();

    expect(testRequest.settings.name).toBe(settingsName);
    expect(testRequest.settings.section).toBe('');
  });

  it('parses the settings section', () => {
    const settingsName    = 'requestTestSettingsSectionParsing';
    const settingsSection = 'requestTestSettingsSectionParsingSectionName';
    testRequest.url = `/${settingsName}${encodeURI(RequestStatic.SECTION_SEPARATOR)}${settingsSection}`;

    testDataHandler();

    expect(testRequest.settings.name).toBe(settingsName);
    expect(testRequest.settings.section).toBe(settingsSection);
  });

  it('parses body content', () => {
    const testObject = {name: 'parseBodyContent'};
    testRequest.body.raw = JSON.stringify(testObject);

    testDataHandler();

    expect(testRequest.body.parsed).toEqual(testObject);
  });

  it('should invalidate malformed body content', () => {
    testRequest.body.raw = '{"test": ';

    testDataHandler();

    expect(testRequest.error.code).toBe(HTTPConstants.STATUS.BAD_REQUEST);
    expect(testRequest.error.message).toBe(RequestStatic.ERROR_INVALID_CONTENT_SYNTAX());
    expect(testRequest.body.raw).toBe('');
    expect(testRequest.body.parsed).toEqual({});
    expect(httpMock.IncomingMessage.prototype.emit).toHaveBeenCalledTimes(0);
  });

  it('should invalidate a body that isn\'t and object', () => {
    testRequest.body.raw = 'true';

    testDataHandler();

    expect(testRequest.error.code).toBe(HTTPConstants.STATUS.BAD_REQUEST);
    expect(testRequest.error.message).toBe(RequestStatic.ERROR_INVALID_CONTENT_SYNTAX());
    expect(testRequest.body.raw).toBe('');
    expect(testRequest.body.parsed).toEqual({});
    expect(httpMock.IncomingMessage.prototype.emit).toHaveBeenCalledTimes(0);
  });

  it('should emit ready if no errors occur', () => {
    testDataHandler();

    expect(httpMock.IncomingMessage.prototype.emit).toHaveBeenCalledTimes(0);
  });

  it('processes url parameters', () => {
    testRequest.url = '/test?raw=&testing=2';
    testDataHandler();

    expect(testRequest.settings.name).toBe('test');
    expect(testRequest.settings.raw).toBe(true);

    expect(testRequest.queryParameters.testing).toBe('2');
  });
});