jest.mock('os');

import Enviro from '../../../../src/lib/types';
import Logger from '../../../../src/lib/logging/logger';

describe('Enviro.Logging.Logger::constructor', () => {
  let testLogger: Enviro.Logging.Logger;

  it('should default to error logging level', () => {
    testLogger = new Logger();
    expect(testLogger.logLevel).toBe(Logger.ACCESS_LEVEL.WARNING);
  });

  it('should allow overwriting log level', () => {
    testLogger = new Logger(Logger.ACCESS_LEVEL.INFORMATION);
    expect(testLogger.logLevel).toBe(Logger.ACCESS_LEVEL.INFORMATION);
  });
});