/* eslint-disable @typescript-eslint/interface-name-prefix */
import debug from 'debug';
import dotenv from 'dotenv';

dotenv.config();

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

class DefaultLogger implements ILogger {
  private _logger: debug.Debugger;
  private _appLogLevel: number;

  constructor(namespace: string) {
    this._logger = debug(`apollo-mobx-connector.${namespace}`);
    this._appLogLevel = process.env.LOG_LEVEL ? parseInt(process.env.LOG_LEVEL) : 3;
  }

  private log(logLevel: number, msg: string, ...logObjects: any[]): void {
    if (logLevel > this._appLogLevel) return;

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
}

let make: ILoggerFactory = (namespace: string): ILogger => {
  return new DefaultLogger(namespace);
};

function setLoggerFactory(loggerFactory: ILoggerFactory) {
  make = loggerFactory;
}

export const Logger = { make, setLoggerFactory };
