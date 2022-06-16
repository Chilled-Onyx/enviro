jest.mock('fs');
jest.mock('fs/promises');
jest.mock('path');

import Enviro       from '../../../../src/lib/types';
import JSONFile       from '../../../../src/lib/storage/jsonFile';
import fsPromisesMock from 'fs/promises';
import pathMock       from 'path';

describe('JSONFile::delete', () => {
  let testStorage: Enviro.Storage;

  beforeEach(() => {
    testStorage = new JSONFile({});
  });

  it('should delete a file', async () => {
    const settingsName = 'deleteTest';

    const storagePath  = testStorage.config.path;
    const filePath     = `./storage/${settingsName}.json`;

    jest.spyOn(pathMock, 'join').mockReturnValue(filePath);

    await testStorage.delete(settingsName);

    expect(pathMock.join).toHaveBeenCalledTimes(1);
    expect(pathMock.join).toHaveBeenNthCalledWith(1, storagePath, `${settingsName}.json`);

    expect(fsPromisesMock.rm).toHaveBeenCalledTimes(1);
    expect(fsPromisesMock.rm).toHaveBeenNthCalledWith(1, filePath);
  });

  it('should throw an error when delete fails', async () => {
    const settingsName = 'deleteErrorTest';

    const storagePath  = testStorage.config.path;
    const filePath     = `./storage/${settingsName}.json`;

    jest.spyOn(pathMock, 'join').mockReturnValue(filePath);
    jest.spyOn(fsPromisesMock, 'rm').mockImplementation(() => {throw 'test';});

    try {
      await testStorage.delete(settingsName);
      throw 'Expected error not thrown';
    } catch(err) {
      expect(pathMock.join).toHaveBeenCalledTimes(1);
      expect(pathMock.join).toHaveBeenNthCalledWith(1, storagePath, `${settingsName}.json`);

      expect(fsPromisesMock.rm).toHaveBeenCalledTimes(1);
      expect(fsPromisesMock.rm).toHaveBeenNthCalledWith(1, filePath);

      expect(err.toString()).toBe('Unable to delete file.');
    }
  });
});