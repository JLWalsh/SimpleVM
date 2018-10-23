import readline from 'readline';
import IVMIO from '../../core/vm/IVMIO';

class NodeVMIO implements IVMIO {
    write(message: string): void {
        console.log(`VM: ${message}`);    
    }    
    
    async promptImmediate(): Promise<number> {
        const rl = readline.createInterface(process.stdin, process.stdout);

        const value = await new Promise<number>((resolve) => {
            rl.question("Enter an immediate: ", (answer) => {
                resolve(Number(answer));
            });
        });
        
        return value;
    }
}

export default NodeVMIO;