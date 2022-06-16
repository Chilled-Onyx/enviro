jest.mock('fs');
jest.mock('fs/promises');
jest.mock('path');

import Enviro       from '../../../../src/lib/types';
import JSONFile       from '../../../../src/lib/storage/jsonFile';
import fsPromisesMock from 'fs/promises';
import pathMock       from 'path';

describe('JSONFile::write', () => {
  let testStorage: Enviro.Storage;

  beforeEach(() => {
    testStorage = new JSONFile({}, {} as Enviro.Application);
  });

  it('should write settings object data to a file', async () => {
    const settingsName = 'writeTest';

    const storagePath    = testStorage.config.path;
    const filePath       = `./storage/${settingsName}.json`;
    const settingsObj    = {read: true, test: true};
    const settingsString = JSON.stringify(settingsObj);

    jest.spyOn(pathMock, 'join').mockReturnValue(filePath);

    await testStorage.write(settingsName, settingsObj);

    expect(pathMock.join).toHaveBeenCalledTimes(1);
    expect(pathMock.join).toHaveBeenNthCalledWith(1, storagePath, `${settingsName}.json`);

    expect(fsPromisesMock.writeFile).toHaveBeenCalledTimes(1);
    expect(fsPromisesMock.writeFile).toHaveBeenNthCalledWith(1, filePath, settingsString);
  });

  it('should write settings object data to a file', async () => {
    const settingsName = 'writeTest';

    const storagePath    = testStorage.config.path;
    const filePath       = `./storage/${settingsName}.json`;
    const settingsObj    = {read: true, test: true};
    const settingsString = JSON.stringify(settingsObj);

    jest.spyOn(pathMock, 'join').mockReturnValue(filePath);
    jest.spyOn(fsPromisesMock, 'writeFile').mockImplementation(() => {throw 'error'});

    try {
      await testStorage.write(settingsName, settingsObj);
      throw 'Expected error not thrown.';
    } catch(error) {
      expect(pathMock.join).toHaveBeenCalledTimes(1);
      expect(pathMock.join).toHaveBeenNthCalledWith(1, storagePath, `${settingsName}.json`);

      expect(fsPromisesMock.writeFile).toHaveBeenCalledTimes(1);
      expect(fsPromisesMock.writeFile).toHaveBeenNthCalledWith(1, filePath, settingsString);

      expect(error.toString()).toBe('Unable to write file.');
    }
  });
});