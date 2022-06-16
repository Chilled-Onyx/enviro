import Logger from '../../../../src/lib/logging/logger';

describe('Enviro.Logging.Logger::ACCESS_LEVEL', () => {
  it('should have an access level enum', () => {
    expect(Logger.ACCESS_LEVEL.DEBUG).toBe(60);
    expect(Logger.ACCESS_LEVEL.INFORMATION).toBe(50);
    expect(Logger.ACCESS_LEVEL.NOTICE).toBe(40);
    expect(Logger.ACCESS_LEVEL.WARNING).toBe(30);
    expect(Logger.ACCESS_LEVEL.ERROR).toBe(20);
    expect(Logger.ACCESS_LEVEL.FATAL).toBe(10);
  });
});