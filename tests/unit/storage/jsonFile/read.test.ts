jest.mock('fs');
jest.mock('fs/promises');
jest.mock('path');

import Enviro       from '../../../../src/lib/types';
import JSONFile       from '../../../../src/lib/storage/jsonFile';
import pathMock       from 'path';
import fsPromisesMock from 'fs/promises';

describe('JSONFile::read', () => {
  let testStorage: Enviro.Storage;

  beforeEach(() => {
    testStorage = new JSONFile({});
  });

  it('should return settings data', async () => {
    const settingsName = 'readTest';

    const storagePath  = testStorage.config.path;
    const filePath     = `./storage/${settingsName}.json`;
    const settingsObj  = {read: true, test: true};
    const returnString = JSON.stringify(settingsObj);

    jest.spyOn(pathMock, 'join').mockReturnValue(filePath);
    jest.spyOn(fsPromisesMock, 'readFile').mockImplementation(async () => returnString);

    expect(await testStorage.read(settingsName)).toStrictEqual(settingsObj);

    expect(pathMock.join).toHaveBeenCalledTimes(1);
    expect(pathMock.join).toHaveBeenNthCalledWith(1, storagePath, `${settingsName}.json`);

    expect(fsPromisesMock.readFile).toHaveBeenCalledTimes(1);
    expect(fsPromisesMock.readFile).toHaveBeenNthCalledWith(1, filePath, 'utf8');
  });

  it('should error if there was a problem reading the settings file', async () => {
    const settingsName = 'readErrorTest';

    const storagePath  = testStorage.config.path;
    const filePath     = `./storage/${settingsName}.json`;

    jest.spyOn(pathMock, 'join').mockReturnValue(filePath);
    jest.spyOn(fsPromisesMock, 'readFile').mockImplementation(async () => {throw 'error'});

    try {
      await testStorage.read(settingsName);
      throw 'Expected error not thrown';
    } catch(error) {
      expect(pathMock.join).toHaveBeenCalledTimes(1);
      expect(pathMock.join).toHaveBeenNthCalledWith(1, storagePath, `${settingsName}.json`);

      expect(fsPromisesMock.readFile).toHaveBeenCalledTimes(1);
      expect(fsPromisesMock.readFile).toHaveBeenNthCalledWith(1, filePath, 'utf8');

      expect(error.toString()).toBe('Unable to read file.');
    }
  });
});