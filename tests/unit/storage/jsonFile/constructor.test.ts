jest.mock('fs');
jest.mock('fs/promises');
jest.mock('path');

import Enviro       from '../../../../src/lib/types';
import JSONFile       from '../../../../src/lib/storage/jsonFile';
import fsMock         from 'fs';

describe('JSONFile::constructor', () => {
  const mockApplication: Enviro.Application = {} as Enviro.Application;
  let testStorage: Enviro.Storage;

  beforeEach(() => {
    testStorage = new JSONFile({}, mockApplication);
  });

  it('should default the config directory', () => {
    expect(testStorage.config.path).toBe('./storage');
  });

  it('should create a storage directory if one does not exist', () => {
    expect(fsMock.existsSync).toHaveBeenCalledTimes(1);
    expect(fsMock.existsSync).toHaveBeenNthCalledWith(1, testStorage.config.path);
    expect(fsMock.mkdirSync).toHaveBeenCalledTimes(1);
    expect(fsMock.mkdirSync).toHaveBeenNthCalledWith(1, testStorage.config.path, { recursive: true });
  });

  it('sets that application', () => {
    expect(testStorage.enviro).toBe(mockApplication);
  });
});