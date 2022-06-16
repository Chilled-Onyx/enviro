import Enviro from '../types';
import { hostname } from 'os';

export class Logger implements Enviro.Logging.Logger {
  public formatted: boolean;
  public logLevel: Logger.ACCESS_LEVEL;
  public outputFunction: Enviro.Logging.LogOutputFunction = process.stdout.write.bind(process.stdout);
  public whiteSpaceCount = 0;

  constructor(logLevel: Logger.ACCESS_LEVEL = Logger.ACCESS_LEVEL.WARNING, formatted = false) {
    this.formatted = formatted;
    this.logLevel = logLevel;
  }

  /**
   * Build a complete log line from a partial one.
   * 
   * @param     { Partial<Enviro.Logging.LogLine> }   partialLogLine 
   * @returns   { Enviro.Logging.LogLine } 
   */
  public getLogLine(partialLogLine: Partial<Enviro.Logging.LogLine>): Enviro.Logging.LogLine {
    partialLogLine.level     ||= Logger.ACCESS_LEVEL.INFORMATION;
    partialLogLine.time      ||= new Date().toISOString();
    partialLogLine.group  ||= '';
    partialLogLine.message   ||= '';
    partialLogLine.pid       ||= process.pid;
    partialLogLine.hostname  ||= hostname();
    partialLogLine.extraData ||= {};

    return partialLogLine as Enviro.Logging.LogLine;
  }

  /**
   * Build a full log line, and send it to the output function if it meets log level requirements.
   * 
   * @param     { Partial<Enviro.Logging.LogLine> } partialLogLine 
   * @returns   { Promise<Enviro.Logging.Logger> }
   */
  public async log(partialLogLine: string | Partial<Enviro.Logging.LogLine>): Promise<this> {
    if('string' === typeof partialLogLine) {
      partialLogLine = {message: partialLogLine};
    }

    const logLine: Enviro.Logging.LogLine = this.getLogLine(partialLogLine);

    if(logLine.level <= this.logLevel) {
      let whiteSpaceCount = 0;

      if(this.formatted) {
        whiteSpaceCount = 2;
      }

      this.outputFunction(JSON.stringify(logLine, null, whiteSpaceCount)+'\n\n');
    }

    return this;
  }
}

/* istanbul ignore next */
export namespace Logger {
  /**
   * Logger access levels
   */
  export const enum ACCESS_LEVEL {
    DEBUG       = 60,
    INFORMATION = 50,
    NOTICE      = 40,
    WARNING     = 30,
    ERROR       = 20,
    FATAL       = 10
  }
}

export default Logger;