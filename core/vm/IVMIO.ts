export default interface IVMIO {
    write(message: string): void;
    promptImmediate(): Promise<number>;
}