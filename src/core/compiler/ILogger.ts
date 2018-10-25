interface ILogger {
  error(message: string, line?: number): void;
}

export default ILogger;