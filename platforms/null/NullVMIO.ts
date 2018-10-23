import IVMIO from "../../core/vm/IVMIO";

class NullVMIO implements IVMIO {
    write(message: string): void {
        throw new Error("Should not write to null.");
    }   
    
    promptImmediate(): number | Promise<number> {
        throw new Error("Should not prompt from null.");
    }
}

export default NullVMIO;