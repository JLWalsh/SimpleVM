import VM from "./VM";
import Instruction from "../common/Instruction";
import FOpcodeExecutor from "./FOpcodeExecutor";

// Arithmetic operations
const add : FOpcodeExecutor = ({ reg1, reg2, reg3 }: Instruction, vm: VM) => {
    const sum = vm.registers.get(reg2) + vm.registers.get(reg3);
    vm.registers.set(reg1, sum);

    return vm.instructionPointer + 1;
}

const sub: FOpcodeExecutor = ({ reg1, reg2, reg3 }: Instruction, vm: VM) => {
    const sum = vm.registers.get(reg2) - vm.registers.get(reg3);
    vm.registers.set(reg1, sum);

    return vm.instructionPointer + 1;
}

// IO operations
const prompti: FOpcodeExecutor = async ({ reg1 }: Instruction, vm: VM) => {
    const immediate = await vm.io.promptImmediate();
    vm.registers.set(reg1, immediate);

    return vm.instructionPointer + 1;
}

const regdump: FOpcodeExecutor = async ({ reg1 }: Instruction, vm: VM) => {
    const value = vm.registers.get(reg1);
    vm.io.write(`REGDUMP of reg ${reg1 + 1}: ${value}`);

    return vm.instructionPointer + 1;
}

// Control-flow operations
const cmp: FOpcodeExecutor = async ({ reg1, reg2 }: Instruction, vm: VM) => {
    const delta = vm.registers.get(reg1) - vm.registers.get(reg2);
    vm.registers.setZ(delta);

    return vm.instructionPointer + 1;
}

const jle: FOpcodeExecutor = async ({ jumpAddress }: Instruction, vm: VM) => {
    if(vm.registers.getZ() <= 0) {
        return jumpAddress;
    }

    return vm.instructionPointer + 1;
}

const jmp: FOpcodeExecutor = async ({ jumpAddress }: Instruction, vm: VM) => {
    return jumpAddress;
}

const halt: FOpcodeExecutor = async ({ jumpAddress }: Instruction, vm: VM) => {
    vm.running = false;
    
    return vm.instructionPointer + 1;
}

// Memory operations
const loadi: FOpcodeExecutor = async ({ reg1, immediate }: Instruction, vm: VM) => {
    vm.registers.set(reg1, immediate);

    return vm.instructionPointer + 1;
}

const addi: FOpcodeExecutor = async ({ reg1, immediate }: Instruction, vm: VM) => {
    const value = vm.registers.get(reg1) + immediate;
    vm.registers.set(reg1, value);

    return vm.instructionPointer + 1;
}

export default [halt, loadi, add, regdump, prompti, cmp, jle, jmp, addi, sub];