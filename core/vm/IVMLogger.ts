export default interface IVMLogger {
    error(error: string): void;
    warn(warning: string): void;
}