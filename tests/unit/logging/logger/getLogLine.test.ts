jest.mock('os');

import Enviro from '../../../../src/lib/types';
import Logger from '../../../../src/lib/logging/logger';
import osMock from 'os';

describe('Enviro.Logging.Logger:getLogLine', () => {
  let testLogger: Enviro.Logging.Logger;

  beforeEach(() => {
    testLogger = new Logger();
  });

  it('should build a log line with no information', () => {
    jest.spyOn(osMock, 'hostname').mockReturnValue('testMachine');

    expect(testLogger.getLogLine({})).toEqual({
      level: Logger.ACCESS_LEVEL.INFORMATION,
      time: expect.any(String),
      group: '',
      message: '',
      pid: process.pid,
      hostname: 'testMachine',
      extraData: {}
    });
  });

  it('should build a log line with no information', () => {
    jest.spyOn(osMock, 'hostname').mockReturnValue('testMachineTwo');

    expect(testLogger.getLogLine({message: 'testingMessage'})).toEqual({
      level: 50,
      time: expect.any(String),
      group: '',
      message: 'testingMessage',
      pid: process.pid,
      hostname: 'testMachineTwo',
      extraData: {}
    });
  });
});