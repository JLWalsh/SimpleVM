import IVMLogger from "../../core/vm/IVMLogger";

class ConsoleVMLogger implements IVMLogger {
    error(error: string): void {
        console.error(error);    
    }

    warn(warning: string): void {
        console.warn(warning);
    }
}

export default ConsoleVMLogger;