jest.mock('os');

import Enviro from '../../../../src/lib/types';
import Logger from '../../../../src/lib/logging/logger';

describe('Enviro.Logging.Logger', () => {
  let testLogger: Enviro.Logging.Logger;

  beforeEach(() => {
    testLogger = new Logger();
    testLogger.getLogLine = jest.fn().mockImplementation((inputValue) => {
      inputValue.level = 20;
      return inputValue;
    });
    testLogger.outputFunction = jest.fn();
  });

  it('should accept a string', async () => {
    expect(await testLogger.log('test message 001')).toBe(testLogger);
    expect(testLogger.getLogLine).toHaveBeenCalledTimes(1);
    expect(testLogger.getLogLine).toHaveBeenNthCalledWith(1, {
      level: 20,
      message: 'test message 001'
    });
    expect(testLogger.outputFunction).toHaveBeenCalledTimes(1);
    expect(testLogger.outputFunction).toHaveBeenNthCalledWith(1, JSON.stringify({
      message: 'test message 001',
      level: 20
    })+'\n\n');
  });

  it('should accept an object', async() => {
    expect(await testLogger.log('test message 002')).toBe(testLogger);
    expect(testLogger.getLogLine).toHaveBeenCalledTimes(1);
    expect(testLogger.getLogLine).toHaveBeenNthCalledWith(1, {
      level: 20,
      message: 'test message 002'
    });
    expect(testLogger.outputFunction).toHaveBeenCalledTimes(1);
    expect(testLogger.outputFunction).toHaveBeenNthCalledWith(1, JSON.stringify({
      message: 'test message 002',
      level: 20
    })+'\n\n');
  });

  it('should not call the output function if the log level is too high', async () => {
    testLogger.logLevel = 10;

    expect(await testLogger.log('test message 003')).toBe(testLogger);
    expect(testLogger.getLogLine).toHaveBeenCalledTimes(1);
    expect(testLogger.getLogLine).toHaveBeenNthCalledWith(1, {
      level: 20,
      message: 'test message 003'
    });
    expect(testLogger.outputFunction).toHaveBeenCalledTimes(0);
  });

  it('should format logs', async() => {
    testLogger = new Logger(40, true);
    testLogger.getLogLine = jest.fn().mockImplementation((inputValue) => {
      inputValue.level = 20;
      return inputValue;
    });
    testLogger.outputFunction = jest.fn();

    expect(await testLogger.log('test message 004')).toBe(testLogger);
    expect(testLogger.getLogLine).toHaveBeenCalledTimes(1);
    expect(testLogger.getLogLine).toHaveBeenNthCalledWith(1, {
      level: 20,
      message: 'test message 004'
    });
    expect(testLogger.outputFunction).toHaveBeenCalledTimes(1);
    expect(testLogger.outputFunction).toHaveBeenNthCalledWith(1, JSON.stringify({
      message: 'test message 004',
      level: 20
    }, null, 2)+'\n\n');
  });
});