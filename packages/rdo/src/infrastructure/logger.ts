/* eslint-disable @typescript-eslint/interface-name-prefix */
import debug from 'debug';
import dotenv from 'dotenv';

dotenv.config();

export type LogLevels = 0 | 1 | 2 | 3 | 4 | 5;

export interface ILogger {
  error(msg: string, ...logObjects: any[]): void;
  warn(msg: string, ...logObjects: any[]): void;
  info(msg: string, ...logObjects: any[]): void;
  debug(msg: string, ...logObjects: any[]): void;
  trace(msg: string, ...logObjects: any[]): void;
}

export interface ILoggerFactory {
  (namespace: string): ILogger;
}

export class DefaultLogger implements ILogger {
  private _logger: debug.Debugger;
  private static _appLogLevel: number;

  constructor(namespace: string) {
    this._logger = debug(`rdo.${namespace}`);
    DefaultLogger._appLogLevel = process.env.RDO_LOG_LEVEL ? parseInt(process.env.RDO_LOG_LEVEL) : 3;
  }

  private log(logLevel: number, msg: string, ...logObjects: any[]): void {
    if (logLevel > DefaultLogger._appLogLevel) return;

    if (logLevel === 1) console.error(msg, logObjects);
    else if (logLevel === 2) console.warn(msg, logObjects);
    else console.log(msg, logObjects);

    // Debug logger not working. Need to debug at some point. Falling back to console.log
    //if (logObjects) this._logger(msg, ...logObjects);
    //else this._logger(msg);
  }

  public error(msg: string, ...logObjects: any[]): void {
    this.log(1, `ERROR!!!: ${msg}`, logObjects);
  }

  public warn(msg: string, ...logObjects: any[]): void {
    this.log(2, `WARN!: ${msg}`, logObjects);
  }

  public info(msg: string, ...logObjects: any[]): void {
    this.log(3, `Info: ${msg}`, logObjects);
  }

  public debug(msg: string, ...logObjects: any[]): void {
    this.log(4, `Debug: ${msg}`, logObjects);
  }

  public trace(msg: string, ...logObjects: any[]): void {
    this.log(5, `Trace: ${msg}`, logObjects);
  }

  public static setGlobalLogLevel(logLevel: LogLevels) {
    DefaultLogger._appLogLevel = logLevel;
  }
}

let make: ILoggerFactory = (namespace: string): ILogger => {
  return new DefaultLogger(namespace);
};

function setLoggerFactory(loggerFactory: ILoggerFactory) {
  make = loggerFactory;
}

export const Logger = { make, setLoggerFactory };
