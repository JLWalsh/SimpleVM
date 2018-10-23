import BytecodeDecoder from "./vm/BytecodeDecoder";
import Instruction from "./common/Instruction";

const createVM = (promptImmediate, writeImmediate) => {
  const NUMBER_OF_REGISTERS = 16;

  let running = true;
  let zRegister = 0;
  let instructionPointer = 0;

  const registers = new Array(NUMBER_OF_REGISTERS);
  const Opcodes = {
    HALT: 0,
    LOADI: 1,
    ADD: 2,
    REGDUMP: 3,
    PROMPTI: 4,
    CMP: 5,
    JLE: 6,
    JMP: 7,
    ADDI: 8,
    SUB: 9,
  }

  const readRegister = (id) => {
    if(id >= registers.length) {
      console.error(`FATAL: Tried to access register ${id}, but it does not exist.`);
    }

    return registers[id];
  }

  const setRegister = (id, value) => {
    if (id >= registers.length) {
      console.error(`FATAL: Tried to set register ${id} to value ${value}, but it does not exist.`);
    }

    registers[id] = value;
  }

  const setZRegister = (value) => {
    zRegister = value;
  }

  const eval = async (instruction: Instruction) => {
    switch(instruction.opcode) {
      case Opcodes.HALT:
        running = false;
        break;
      case Opcodes.LOADI:
        setRegister(instruction.reg1, instruction.immediate);
        break;
      case Opcodes.ADD:
        const sum = readRegister(instruction.reg2) + readRegister(instruction.reg3);
        setRegister(instruction.reg1, sum);
        break;
      case Opcodes.REGDUMP:
        writeImmediate(readRegister(instruction.reg1), instruction.reg1);
        break;
      case Opcodes.PROMPTI:
        const immediate = await promptImmediate();
        const value = Number(immediate);
        setRegister(instruction.reg1, value);
        break;
      case Opcodes.CMP:
        const delta = readRegister(instruction.reg1) - readRegister(instruction.reg2);
        setZRegister(delta);
        break;
      case Opcodes.JLE:
        if(zRegister <= 0) {
          instructionPointer = instruction.jumpAddress;
        }
        break;
      case Opcodes.JMP:
        instructionPointer = instruction.jumpAddress;
        break;
      case Opcodes.ADDI:
        const regValue = readRegister(instruction.reg1);
        const newValue = regValue + instruction.immediate;
        setRegister(instruction.reg1, newValue);
        break;
      case Opcodes.SUB:
        const difference = readRegister(instruction.reg2) - readRegister(instruction.reg3);
        setRegister(instruction.reg1, difference);
        break;
      default:
        console.error(`FATAL: Unknown instruction: ${instruction.opcode} at ${instructionPointer} (RAW ${instruction.raw.toString(16)})`);
        break;
    }
  };

  const fetchNextInstruction = (program) => {
    if(instructionPointer >= program.length) {
      instructionPointer = 0;
    }

    return program[instructionPointer++];
  }

  const runProgram = async (program) => {
    const decoder = new BytecodeDecoder();

    while(running) {
      const instruction = fetchNextInstruction(program);
      const decodedInstruction = decoder.decode(instruction);

      await eval(decodedInstruction);
    }

    return 0;
  }

  return { runProgram };
}

module.exports = createVM;