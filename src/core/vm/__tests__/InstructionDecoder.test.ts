import BytecodeDecoder from "../BytecodeDecoder";

describe('InstructionDecoder', () => {

    let bytecodeDecoder: BytecodeDecoder;

    beforeEach(() => {
        bytecodeDecoder = new BytecodeDecoder();
    })

    it('Decodes the instruction correctly', () => {
        const bytecode = 0x4A1C;
        const opcode = 4;
        const reg1 = 10;
        const reg2 = 1;
        const reg3 = 12;
        const immediate = 28;
        const jumpAddress = 2588;

        const instruction = bytecodeDecoder.decode(bytecode);

        expect(instruction.opcode).toEqual(opcode);
        expect(instruction.reg1).toEqual(reg1);
        expect(instruction.reg2).toEqual(reg2);
        expect(instruction.reg3).toEqual(reg3);
        expect(instruction.immediate).toEqual(immediate);
        expect(instruction.jumpAddress).toEqual(jumpAddress);
    });
});