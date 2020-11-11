export declare type LogLevels = 0 | 1 | 2 | 3 | 4 | 5;
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
export declare class DefaultLogger implements ILogger {
    private _logger;
    private static _appLogLevel;
    constructor(namespace: string);
    private log;
    error(msg: string, ...logObjects: any[]): void;
    warn(msg: string, ...logObjects: any[]): void;
    info(msg: string, ...logObjects: any[]): void;
    debug(msg: string, ...logObjects: any[]): void;
    trace(msg: string, ...logObjects: any[]): void;
    static setGlobalLogLevel(logLevel: LogLevels): void;
}
declare function setLoggerFactory(loggerFactory: ILoggerFactory): void;
export declare const Logger: {
    make: ILoggerFactory;
    setLoggerFactory: typeof setLoggerFactory;
};
export {};
