const decode = (instruction) => {
  const opcode = (instruction & 0xF000) >> 12;
  const reg1 = (instruction & 0xF00) >> 8;
  const reg2 = (instruction & 0xF0) >> 4;
  const reg3 = (instruction & 0xF);
  const immediate = (instruction & 0xFF);
  const position = (instruction & 0xFFF);

  return { opcode, reg1, reg2, reg3, immediate, position };
}

const createVM = (numRegisters) => {
  let running = true;
  let zRegister = 0;
  let instructionPointer = 0;

  const registers = new Array(numRegisters);
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

  const eval = (instruction) => {
    switch(instruction.opcode) {
      case Opcodes.HALT:
        running = false;
        //console.warn("Machine halted");
        break;
      case Opcodes.LOADI:
        setRegister(instruction.reg1, instruction.immediate);
        //console.log(`Load reg ${instruction.reg1} with immediate value ${instruction.immediate}`);
        break;
      case Opcodes.ADD:
        const sum = readRegister(instruction.reg2) + readRegister(instruction.reg3);
        setRegister(instruction.reg1, sum);
        //console.log(`Add reg ${instruction.reg1} + ${instruction.reg2} into ${instruction.reg3} = ${sum}`);
        break;
      case Opcodes.REGDUMP:
        console.warn(`REGDUMP of reg ${instruction.reg1}: ${readRegister(instruction.reg1)}`);
        break;
      case Opcodes.PROMPTI:
        const value = Number(window.prompt("Enter an instant value"));
        setRegister(instruction.reg1, value);
        break;
      case Opcodes.CMP:
        const delta = readRegister(instruction.reg1) - readRegister(instruction.reg2);
        setZRegister(delta);
        break;
      case Opcodes.JLE:
        if(zRegister <= 0) {
          instructionPointer = instruction.position;
        }
        break;
      case Opcodes.JMP:
        instructionPointer = instruction.position;
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
        console.error(`FATAL: Unknown instruction: ${instruction.opcode}`);
        break;
    }
  };

  const fetchNextInstruction = (program) => {
    if(instructionPointer >= program.length) {
      instructionPointer = 0;
    }

    return program[instructionPointer++];
  }

  const runProgram = (program) => {
    while(running) {
      const instruction = fetchNextInstruction(program);
      const decodedInstruction = decode(instruction);

      eval(decodedInstruction);
    }
  }

  return { runProgram };
}

const vm = createVM(4);
vm.runProgram([0x1001, 0x1101, 0x1201, 0x4300, 0x7008, 0x2110, 0x9010, 0x8201, 0x5230, 0x6005, 0x3100, 0x0000]);