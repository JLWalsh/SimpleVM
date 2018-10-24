import VM from '../VM';
import Instruction from '../../common/Instruction';
import Opcode from '../../common/Opcode';
import OpcodeExecutors from '../OpcodeExecutors';
import IVMIO from '../IVMIO';

describe('OpcodeExecutors', () => {

    const FILLER_INSTRUCTION_VALUES = { reg1: 0, reg2: 0, reg3: 0, jumpAddress: 0, immediate: 0 };

    const createInstructionWith = (opcode: Opcode, values:
        { reg1?: number, reg2?: number, reg3?: number, immediate?: number, jumpAddress?: number }): Instruction => {
        return new Instruction({ ...FILLER_INSTRUCTION_VALUES, ...values, opcode });
    }

    let vm: VM;

    beforeEach(() => {
        const MockIO = jest.fn<IVMIO>(() => ({
            write: jest.fn(),
        }));

        vm = new VM(new MockIO());
    });

    describe('HALT', () => {
        const instruction = createInstructionWith(Opcode.HALT, {});

        it('stops the VM', () => {
            OpcodeExecutors[Opcode.HALT](instruction, vm);

            expect(vm.running).toBeFalsy();
        });

        it('increments the IP by one', async () => {
            const newIP = await OpcodeExecutors[Opcode.HALT](instruction, vm);

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

        it('increments the IP by one', async () => {
            const newIP = await OpcodeExecutors[Opcode.LOADI](instruction, vm);

            expect(newIP).toEqual(1);
        });
    });

    describe('ADD', () => {
        const firstRegisterValue = 10;
        const firstRegister = 4;
        const secondRegisterValue = 23;
        const secondRegister = 8;
        const resultRegister = 2;
        const instruction = createInstructionWith(Opcode.ADD, { reg1: resultRegister, reg2: firstRegister, reg3: secondRegister });

        it('stores the sum in the correct register', () => {
            vm.registers.set(firstRegister, firstRegisterValue);
            vm.registers.set(secondRegister, secondRegisterValue);

            OpcodeExecutors[Opcode.ADD](instruction, vm);

            expect(vm.registers.get(resultRegister)).toEqual(firstRegisterValue + secondRegisterValue);
        });

        it('increments the IP by one', async () => {
            const newIP = await OpcodeExecutors[Opcode.ADD](instruction, vm);

            expect(newIP).toEqual(1);
        });
    });

    describe('REGDUMP', () => {
        const registerToDump = 4;
        const registerValue = 27;

        const instruction = createInstructionWith(Opcode.REGDUMP, { reg1: registerToDump });

        beforeEach(() => {
            vm.registers.set(registerToDump, registerValue);
        });

        it('should dump the register using the vm output', () => {
            const regdumpPattern = `REGDUMP of reg ${registerToDump + 1}: ${registerValue}`; // Registers are 0-indexed

            OpcodeExecutors[Opcode.REGDUMP](instruction, vm);

            expect(vm.io.write).toHaveBeenCalledWith(regdumpPattern);
        });

        it('should increment the IP by one', async () => {
            const newIP = await OpcodeExecutors[Opcode.REGDUMP](instruction, vm);

            expect(newIP).toEqual(1);
        });
    });

    describe('PROMPTI', () => {
        const immediateReturned = 40;
        const destinationRegister = 11;
        const instruction = createInstructionWith(Opcode.PROMPTI, { reg1: destinationRegister }); 

        beforeEach(() => {
            const MockIOReturn = jest.fn<IVMIO>(() => ({
                promptImmediate: () => immediateReturned,
            }));

            vm = new VM(new MockIOReturn());
        })

        it('should prompt from vm in', async () => {
            await OpcodeExecutors[Opcode.PROMPTI](instruction, vm);

            expect(vm.registers.get(destinationRegister)).toEqual(immediateReturned);
        });

        it('should increment the IP by one', async () => {
            const newIP = await OpcodeExecutors[Opcode.PROMPTI](instruction, vm);

            expect(newIP).toEqual(1);
        });
    });

    describe('CMP', () => {
        const firstRegister = 8;
        const secondRegister = 15;
        const firstRegisterValue = 22;
        const secondRegisterValue = 45;
        const instruction = createInstructionWith(Opcode.CMP, { reg1: firstRegister, reg2: secondRegister });

        beforeEach(() => {
            vm.registers.set(firstRegister, firstRegisterValue);
            vm.registers.set(secondRegister, secondRegisterValue);
        });

        it('should set register z to the difference between the two registers', () => {
            OpcodeExecutors[Opcode.CMP](instruction, vm);

            expect(vm.registers.getZ()).toEqual(firstRegisterValue - secondRegisterValue);
        });

        it('should increment the IP by one', async () => {
            const newIP = await OpcodeExecutors[Opcode.CMP](instruction, vm);

            expect(newIP).toEqual(1);
        });
    });

    describe('JLE', () => {
        const jumpAddress = 125;
        const instruction = createInstructionWith(Opcode.JLE, { jumpAddress });

        it('should not jump given a difference greater than zero', async () => {
            vm.registers.setZ(27);

            const newIP = await OpcodeExecutors[Opcode.JLE](instruction, vm);

            expect(newIP).toEqual(1);
        });

        it('should jump given difference smaller than zero', async () => {
            vm.registers.setZ(-15);

            const newIP = await OpcodeExecutors[Opcode.JLE](instruction, vm);

            expect(newIP).toEqual(jumpAddress);
        });

        it('should jump given difference equal to zero', async () => {
            vm.registers.setZ(0);

            const newIP = await OpcodeExecutors[Opcode.JLE](instruction, vm);

            expect(newIP).toEqual(jumpAddress);
        });
    });

    describe('JMP', () => {
        const jumpAddress = 1337;
        const instruction = createInstructionWith(Opcode.JMP, { jumpAddress });

        it('should jump the the specified IP', async () => {
            const newIP = await OpcodeExecutors[Opcode.JMP](instruction, vm);

            expect(newIP).toEqual(jumpAddress);
        });
    });

    describe('ADDI', () => {
        const register = 0;
        const initialValue = 16;
        const valueToAdd = 42;
        const instruction = createInstructionWith(Opcode.ADDI, { reg1: register, immediate: valueToAdd });

        beforeEach(() => {
            vm.registers.set(register, initialValue);
        });

        it('should add the immediate value in the specified register', () => {
            OpcodeExecutors[Opcode.ADDI](instruction, vm);

            expect(vm.registers.get(register)).toEqual(initialValue + valueToAdd);
        });

        it('should increment the IP by one', async () => {
            const newIP = await OpcodeExecutors[Opcode.ADDI](instruction, vm);

            expect(newIP).toEqual(1);
        });
    });

    describe('SUB', () => {
        const firstRegister = 0;
        const secondRegister = 3;
        const destinationRegister = 6;
        const firstRegisterValue = 10;
        const secondRegisterValue = 8;
        const instruction = createInstructionWith(Opcode.SUB, { reg1: destinationRegister, reg2: firstRegister, reg3: secondRegister });

        beforeEach(() => {
            vm.registers.set(firstRegister, firstRegisterValue);
            vm.registers.set(secondRegister, secondRegisterValue);
        });

        it('should store the difference of the two registers in the specified register', () => {
            OpcodeExecutors[Opcode.SUB](instruction, vm);

            expect(vm.registers.get(destinationRegister)).toEqual(firstRegisterValue -  secondRegisterValue);
        });

        it('should increment the IP by one', async () => {
            const newIP = await OpcodeExecutors[Opcode.SUB](instruction, vm);

            expect(newIP).toEqual(1);
        });
    });
});

