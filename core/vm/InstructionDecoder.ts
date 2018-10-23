import Instruction from "../common/Instruction";

class InstructionDecoder {

    public decode(rawInstruction: number): Instruction {
        const opcode = (rawInstruction & 0xF000) >> 12;
        const reg1 = (rawInstruction & 0xF00) >> 8;
        const reg2 = (rawInstruction & 0xF0) >> 4;
        const reg3 = (rawInstruction & 0xF);
        const immediate = (rawInstruction & 0xFF);
        const jumpAddress = (rawInstruction & 0xFFF);

        return new Instruction({ opcode, reg1, reg2, reg3, immediate, jumpAddress });
    }
    
}