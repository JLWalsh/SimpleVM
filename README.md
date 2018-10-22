# Simple VM
##### By James L. Walsh

### Introduction
This virtual machine was written in Javascript with the sole intention of learning more about how they work. This project is heavily inspired by [this online guide published on WikiBooks](https://en.wikibooks.org/wiki/Creating_a_Virtual_Machine/Register_VM_in_C), except it's written in JS and has more instructions. The machine is a register-based virtual machine, which means that is uses register to store arguments when invoking an opcode.

### Compiler
A basic (and most likely buggy) compiler is available under the `platforms/node` directory. Here you will find `svmc.bat`, which can be used to call node on `compiler.node.js` with the file to compile. 

*Example*: `svmc.bat myprogram.svms mycompiledprogram.svm`

### Launching the virtual machine
As for now, the only target environnement for the virtual machine is Node. Extending to an other environnement is as simple as providing two functions, being `promptImmediate` and `writeImmediate`. To run a compiled program, simply use `svm.bat` from the `platforms/node` directory.

*Example*: `svm.bat mycompiledprogram.svm`

### Instructions

##### How to read bytes used
The number between the brackets represents the position of the bits that represent the value in a 16 bit instruction. 

**Ex:** 
*[5-8]*: specified register -> translates to: 0000 [bits for specified register] 0000 0000

This indicates the the bits 5 to 8 (inclusive) of the instructions are to be used to specify a register.

#### HALT
Halts the machine.

**Bits used**

*[0-4]*: HALT opcode

**Example**

`0x0000` 

Halts the machine.

#### LOADI
Loads an instant value into the specified register.

**Bits used**

*[0-4]*: LOADI opcode

*[5-8]*: Specified register

*[9-16]*: Instant value

**Example**

`0x1209` 

Loads 9 into register 3 (note that registers are zero-indexed!).

#### ADD
Adds two registers together and stores the sum into the specified register.

**Bits used**

*[0-4]*: ADD opcode

*[5-8]*: Left operand register

*[9-12]*: Right operand register

*[13-16]*: Specified register

**Example**

`0x2210` 

Adds register 3 and register 2 into register 1.

#### REGDUMP
Dumps the value of the specified register into the console.

**Bits used**

*[0-4]*: REGDUMP opcode

*[5-8]*: Specified register

**Example**

`0x3100` 

Dumps the value of the register 2.

#### PROMPTI
Prompts an instant value from the user and stores it into the specified register (uses window.prompt for now).

**Bits used**

*[0-4]*: PROMPTI opcode

*[5-8]*: Specified register

**Example**

`0x4300` 

Prompts the user for an instant value and stores it into the register 4.

#### CMP
Computes the difference (SUB) between two registers and stores it into a special register called the Z register. The value of the Z register can then be used for jump-related instructions like `JLE`.

**Bits used**

*[0-4]*: CMP opcode

*[5-8]*: Left operand register

*[8-9]*: Right operand register

**Example**

`0x5230` 

Compares the value of register 3 with register 4.

#### JLE
Jumps to the specified instruction if the value of the Z register is negative or equal to 0. This stands for "Jumps less or equal".

**Bits used**

*[0-4]*: JLE opcode

*[5-16]*: Specified instruction

**Example**

`0x6005` 

Jumps to instruction #5 if the comparison `CMP` evaluated to a negative number.

#### JMP
Jumps to the specified instruction (basically a GOTO).

**Bits used**

*[0-4]*: JMP opcode

*[5-16]*: Specified instruction

**Example**

`0x7008` 

Jumps to instruction #8.

#### ADDI
Increments the specified register by a specified instant value.

**Bits used**

*[0-4]*: ADDI opcode

*[5-8]*: Specified register

*[9-16]*: Instant value

**Example**

`0x8201` 

Increments register 3 by 1.

#### SUB
Subtracts the value of two registers and stores it into the specified register.

**Bits used**

*[0-4]*: SUB opcode

*[5-8]*: Left operand register

*[9-12]*: Right operand register

*[13-16]*: Specified register

**Example**

`0x9010` 

Subtracts register 1 with register 2 and stores it back into register 1.


### Notes

- Registers are zero-indexed. Meaning that if you want to use register 3, you will use 2 when writing bytecode.
- An instant value is a non-negative integer that can be zero.
