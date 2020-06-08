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
declare function setLoggerFactory(loggerFactory: ILoggerFactory): void;
export declare const Logger: {
    make: ILoggerFactory;
    setLoggerFactory: typeof setLoggerFactory;
};
export {};
