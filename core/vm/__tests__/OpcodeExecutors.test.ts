import VM from '../VM';
import Instruction from '../../common/Instruction';
import Opcode from '../../common/Opcode';
import OpcodeExecutors from '../OpcodeExecutors';
import NullVMIO from '../../../platforms/null/NullVMIO';

describe('OpcodeExecutors', () => {

    const FILLER_INSTRUCTION_VALUES = { reg1: 0, reg2: 0, reg3: 0, jumpAddress: 0, immediate: 0 };

    const createInstructionWith = (opcode: Opcode, values:
        { reg1?: number, reg2?: number, reg3?: number, immediate?: number, jumpAddress?: number }): Instruction => {
        return new Instruction({ ...FILLER_INSTRUCTION_VALUES, ...values, opcode });
    }

    let vm: VM;

    beforeEach(() => {
        vm = new VM(new NullVMIO());
    });

    describe('HALT', () => {
        const instruction = createInstructionWith(Opcode.HALT, {});

        it('stops the VM', () => {
            OpcodeExecutors[Opcode.HALT](instruction, vm);

            expect(vm.running).toBeFalsy();
        });

        it('increments the IP by one', () => {
            const newIP = OpcodeExecutors[Opcode.HALT](instruction, vm);

            expect(newIP).toEqual(1);
        });
    });

    describe('LOADI', () => {
        const registerToLoad = 2;
        const immediate = 27;
        const instruction = createInstructionWith(Opcode.LOADI, { reg1: registerToLoad, immediate });

        it('loads the immediate in the correct register', () => {
            OpcodeExecutors[Opcode.LOADI](instruction, vm);

            expect(vm.registers.get(registerToLoad)).toEqual(immediate);
        });

        it('increments the IP by one', () => {
            const newIP = OpcodeExecutors[Opcode.LOADI](instruction, vm);

            expect(newIP).toEqual(1);
        });
    });

    describe('ADD', () => {
        const firstRegisterValue = 10;
        const firstRegister = 4;
        const secondRegisterValue = 23;
        const secondRegister = 8;
        const resultRegister = 2;
        const instruction = createInstructionWith(Opcode.ADD, { reg1: resultRegister, reg2: firstRegister, reg3: firstRegister });

        it('stores the sum in the correct register', () => {
            OpcodeExecutors[Opcode.ADD](instruction, vm);

            expect(vm.registers.get(resultRegister)).toEqual(firstRegisterValue + secondRegisterValue);
        });

        it('increments the IP by one', () => {
            const newIP = OpcodeExecutors[Opcode.ADD](instruction, vm);

            expect(newIP).toEqual(1);
        });
    });

    describe('REGDUMP', () => {

    });

    describe('PROMPTI', () => {

    });

    describe('CMP', () => {

    });

    describe('JLE', () => {

    });

    describe('JMP', () => {

    });

    describe('ADDI', () => {

    });

    describe('SUB', () => {

    });
});

