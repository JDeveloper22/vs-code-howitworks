export interface ILogger {
  info(message: string, metadata?: Record<string, unknown>): void;
  error(message: string, error?: unknown): void;
}
