import Instruction from "../common/Instruction";
import BytecodeDecoder from "./BytecodeDecoder";
import IVMIO from "./IVMIO";
import Registers from "./Registers";
import IOpcodeExecutor from "./FOpcodeExecutor";
import IVMLogger from "./IVMLogger";
import opcodes from './Opcodes';

class VM {

    private static readonly MAX_NUM_REGISTERS = 16;

    public readonly io: IVMIO;
    public readonly registers: Registers;
    public running: boolean;
    public instructionPointer: number;

    private readonly decoder: BytecodeDecoder;
    private readonly log: IVMLogger;
    private readonly opcodes: IOpcodeExecutor[];

    private program: number[];

    public constructor(log: IVMLogger, io: IVMIO) {
        this.io = io;
        this.log = log;

        this.decoder = new BytecodeDecoder();
        this.registers = new Registers(VM.MAX_NUM_REGISTERS);
        this.opcodes = opcodes;

        this.instructionPointer = 0;
        this.running = false;
        this.program = [];
    }

    public async run(program: number[]):Promise<number> {
        this.program = program;
        this.running = true;

        while (this.running) {
            const instruction = this.next();
            const decodedInstruction = this.decoder.decode(instruction);

            await this.eval(decodedInstruction);
        }

        return 0;
    }

    private async eval(instruction: Instruction) {
        const opcodeExecutor = this.opcodes[instruction.opcode];

        this.instructionPointer = await opcodeExecutor(instruction, this);
    }

    private next():number {
        if(this.instructionPointer >= this.program.length) {
            this.log.error("Program ran out of instructions before halting.");
            this.running = false;
        }

        return this.program[this.instructionPointer];
    }
}

export default VM;