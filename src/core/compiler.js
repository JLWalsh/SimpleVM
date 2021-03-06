const Tokens = {
    HASH: '#',
    AT: '@',
    COLON: ':',
    SEMICOLON: ';',
    NEWLINE: '\n',
    WHITESPACE: ' ',
}

const Statements = {
    WORD: 'WORD',
    REGISTER: 'REGISTER',
    IMMEDIATE: 'IMMEDIATE',
    ADDRESS: 'ADDRESS',
    JUMPLABEL: 'JUMPLABEL',
}

const tokenize = (code, errors) => {

    let position = 0;
    let lastParseStart = 0;
    let line = 0;
    const tokens = [];

    const replaceNonUnixLineReturns = () => code = code.replace(/\r?\n|\r/g, '\n');

    const error = (error) => {
        errors.push(`[${line}] ERROR: ${error}`);
    }

    const isAtEnd = () => position >= code.length;

    const peek = () => code[position];

    const match = (char) => {
        const match = peek() == char;

        if(match)
            advance();

        return match; 
    }

    const advance = () => {
        if(isAtEnd())
            return;

        const token = code[position++];

        return token;
    };

    const addStatement = (token) => {
        addStatementWithValue(token, undefined);
    }

    const addStatementWithValue = (type, value) => {
        const literal = code.substring(lastParseStart, position);

        tokens.push({ type, line, value, literal });
    }

    const isNumeric = (char) => char <= '9' && char >= '0';

    const isWhitespace = (char) => char === ' ';

    const isAlphaNumeric = (char) => (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');

    const isRegister = (str) => {
        if(!str.startsWith('reg'))
            return false;

        const rest = str.substring(3);
        const hasNonNumerics = rest.split('').filter(isNumeric).length > 0;
    
        return hasNonNumerics;
    }
 
    const skipComment = () => {
        while(peek() != '\n' && !isAtEnd())
            advance();
    }

    const parseImmediate = () => {
        while(isNumeric(peek()) && !isAtEnd())
            advance();

        if(lastParseStart == position - 1) {
            error("Expected immediate value after #.");
            return;
        }

        const literal = code.substring(lastParseStart + 1, position);
        const immediate = Number(literal);

        addStatementWithValue(Statements.IMMEDIATE, immediate);
    }

    const parseAddress = () => {
        while (isNumeric(peek()) && !isAtEnd())
            advance();

        if (lastParseStart == position - 1) {
            error("Expected address after @.");
            return;
        }

        const literal = code.substring(lastParseStart + 1, position);
        const address = Number(literal);

        addStatementWithValue(Statements.ADDRESS, address);
    }

    const parseText = () => {
        while((isAlphaNumeric(peek()) || isNumeric(peek())) && !isAtEnd())
            advance();

        if(match(Tokens.COLON)) {
            const label = code.substring(lastParseStart, position - 1);
            addStatementWithValue(Statements.JUMPLABEL, label);

            return;
        }

        if(!isAlphaNumeric(peek())) {
            const text = code.substring(lastParseStart, position);

            if(isRegister(text)) {
                const register = Number(text.substring(3));
                addStatementWithValue(Statements.REGISTER, register);
            } else {
                addStatementWithValue(Statements.WORD, text);
            }

            return;
        }

        error(`Unrecognized statement: ${code[position]}`);
    }

    replaceNonUnixLineReturns();
    while(!isAtEnd()) {
        lastParseStart = position;
        const token = advance();
        
        switch(token) {
            case Tokens.SEMICOLON: skipComment(); break;
            case Tokens.HASH: parseImmediate(); break;
            case Tokens.AT: parseAddress(); break;
            case Tokens.NEWLINE: line++; break;
            case Tokens.WHITESPACE: break;
            default: parseText(); break;
        }
    }

    return tokens;
};

const Opcodes = {
    HALT: 'HALT',
    LOADI: 'LOADI',
    ADD: 'ADD',
    REGDUMP: 'REGDUMP',
    PROMPTI: 'PROMPTI',
    CMP: 'CMP',
    JLE: 'JLE',
    JMP: 'JMP',
    ADDI: 'ADDI',
    SUB: 'SUB',
}

const parse = (statements, errors) => {
    const instructions = [];
    const jumpTable = [];

    let instructionArgs = [];
    let instructionPosition = 0;
    let statementPosition = 0;
    
    const error = (error, statement) => {
        errors.push(`[${statement.line}, ${statement.type}] ERROR: ${error}`);

        recover();
    }

    const isInstruction = (keyword) => Object.keys(Instructions).indexOf(keyword) !== -1;
    const isRegister = (keyword) => keyword.startsWith(Special.REG_PREFIX); 
    const isAtEnd = () => statementPosition >= statements.length;

    const addInstruction = (opcode) => {
        instructions.push({ opcode, args: instructionArgs });
        instructionPosition++;
        instructionArgs = [];
    }

    const advance = () => {
        return statements[statementPosition++];
    }

    const peekType = () => {
        if(isAtEnd())
            return undefined;
             
        return statements[statementPosition].type;
    }

    const recover = () => {
        while((peekType() !== Statements.WORD && peekType() !== Statements.JUMPLABEL) && !isAtEnd()) {
            advance();
        }
    }

    const matchArg = (type) => {
        if(isAtEnd() || peekType() !== type)
            return false;

        instructionArgs.push(advance());

        return true;
    }

    const opcode = (opcode) => {
        switch(opcode.value) {
            case Opcodes.HALT: addInstruction(Opcodes.HALT); break;
            case Opcodes.ADD: {
                if(!matchArg(Statements.REGISTER)) {
                    error('Destination register is missing.', opcode);
                    return;
                }

                if(!matchArg(Statements.REGISTER)) {
                    error('Left operand regiter is missing.', opcode);
                    return;
                }

                if(!matchArg(Statements.REGISTER)) {
                    error('Right operand register is missing.', opcode);
                    return;
                }

                addInstruction(Opcodes.ADD);

                break;
            }
            case Opcodes.LOADI: {
                if(!matchArg(Statements.REGISTER)) {
                    error('Destination register is missing', opcode);
                    return;
                }

                if(!matchArg(Statements.IMMEDIATE)) {
                    error('Immediate value is missing', opcode);
                    return;
                }

                addInstruction(Opcodes.LOADI);

                break;
            }
            case Opcodes.REGDUMP: {
                if(!matchArg(Statements.REGISTER)) {
                    error('Register to dump is missing', opcode);
                    return;
                }

                addInstruction(Opcodes.REGDUMP);

                break;
            }
            case Opcodes.PROMPTI: {
                if(!matchArg(Statements.REGISTER)) {
                    error('Register to store user immediate is missing', opcode);
                    return;
                }

                addInstruction(Opcodes.PROMPTI);

                break;
            }
            case Opcodes.CMP: {
                if(!matchArg(Statements.REGISTER)) {
                    error('Left operand register is missing', opcode);
                    return;
                }

                if(!matchArg(Statements.REGISTER)) {
                    error('Right operand register is missing', opcode);
                    return;
                }

                addInstruction(Opcodes.CMP);

                break;
            }
            case Opcodes.JLE: {
                if(!matchArg(Statements.WORD)) {
                    error('Jump label destination is missing', opcode);
                    return;
                }

                addInstruction(Opcodes.JLE);

                break;
            }
            case Opcodes.JMP: {
                if(!matchArg(Statements.WORD)) {
                    error('Jump label destination is missing', opcode);
                    return;
                }

                addInstruction(Opcodes.JMP);

                break;
            }
            case Opcodes.ADDI: {
                if(!matchArg(Statements.REGISTER)) {
                    error('Destination register is missing', opcode);
                    return;
                }

                if(!matchArg(Statements.IMMEDIATE)) {
                    error('Immediate value to add is missing', opcode);
                    return;
                }

                addInstruction(Opcodes.ADDI);

                break;
            }
            case Opcodes.SUB: {
                if(!matchArg(Statements.REGISTER)) {
                    error('Destination register is missing', opcode);
                    return;
                }

                if(!matchArg(Statements.REGISTER)) {
                    error('Left operand register is missing', opcode);
                    return;
                }

                if(!matchArg(Statements.REGISTER)) {
                    error('Right operand register is missing', opcode);
                    return;
                }

                addInstruction(Opcodes.SUB);

                break;
            }
            default: error(`Unrecognized opcode: ${opcode.value}`, opcode);
        }
    }

    const jumpLabel = (jump) => {
        jumpTable.push({ label: jump.value, instructionPosition });
    }

    while(!isAtEnd()) {
        instructionArgs = [];
        const statement = advance();

        switch(statement.type) {
            case Statements.WORD: opcode(statement); break;
            case Statements.JUMPLABEL: jumpLabel(statement); break;
            default:
                error(`Unexpected statement: ${statement.value}.`, statement);
        }
    }

    return { instructions, jumpTable };
}

const validate = ({ instructions, jumpTable }, errors) => {
    const NB_OF_REGISTERS = 16;

    const error = (error, argument) => { 
        errors.push(`[${argument.line}, ${argument.type}] ERROR: ${error}`);
    };
    
    const simpleError = (error) => {
        errors.push(`ERROR: ${error}`);
    }

    const isValidRegister = (register) => register.value < NB_OF_REGISTERS;
    const isValidImmediate = (immediate) => immediate.value < 256;
    const jumpLabelExists = (label) => jumpTable.filter(e => e.label === label.value).length > 0;

    const findDuplicateJumpLabels = () => {
        const uniqueJumpLabels = [];

        jumpTable.forEach(({ label }) => {
            if(uniqueJumpLabels.indexOf(label) !== -1) {
                simpleError(`Jump label ${label} is duplicated`);
            } else {
                uniqueJumpLabels.push(label);
            }
        });
    }

    findDuplicateJumpLabels();

    instructions.forEach(instruction => {
        instruction.args.forEach(arg => {
            if(arg.type === Statements.REGISTER && !isValidRegister(arg))
                error(`Invalid register: ${arg.value}`, arg);

            if(arg.type === Statements.IMMEDIATE && !isValidImmediate(arg))
                error(`Invalid immediate: ${arg.value} (cannot be greater than 256)`, arg);

            if (instruction.type === Statements.JMP || instruction.type === Statements.JLE)
                if(arg.type === Statements.WORD && !jumpLabelExists(arg))
                    error(`Jump label does not exist: ${arg.value}`, arg);
        })
    });
}

const emit = ({ instructions, jumpTable }, errors) => {
    const INSTRUCTION_NIBBLE_SIZE = 4;
    const MASK = 0xFFFF;

    const program = [];

    let compiledInstruction = MASK;
    let nibblePosition = 1;

    const error = (message) => {
        errors.push(`COMPILE ERROR: ${message}`);
    }

    const resolveJumpPosition = (jump) => {
        const jumpPosition = jumpTable.filter(j => j.label === jump.value)[0].instructionPosition;

        if(isNaN(jumpPosition)) {
            error(`Could not find label for jump ${jump.value}`);
        }
        
        return jumpPosition;
    }

    const emit = (value, nibbleLength) => {
        const rightMaskOffset = Math.max((nibblePosition + (nibbleLength - 1)), 0) * 4;
        const leftMaskOffset = (INSTRUCTION_NIBBLE_SIZE - nibblePosition + 1) * 4;

        const rightMask = MASK >> rightMaskOffset;
        const leftMask = (MASK << leftMaskOffset) & MASK; // left bitshift will overflow otherwise
        const valueMask = rightMask | leftMask;

        const offsettedValue = value << ((INSTRUCTION_NIBBLE_SIZE - nibblePosition - (nibbleLength - 1)) * 4);
        const maskedValue = valueMask | offsettedValue;
        
        compiledInstruction = compiledInstruction & maskedValue;
        nibblePosition += nibbleLength;
    }

    const emitRegister = (register) => {
        const registerBits = (register.value - 1);
        emit(registerBits, 1);
    };

    const emitImmediate = (immediate) => {
        emit(immediate.value, 2);
    };

    const emitJump = (jump) => {
        const jumpPosition = resolveJumpPosition(jump);
        emit(jumpPosition, 3);
    };

    const emitOpcode = (opcode) => {
        let opcodeBits = undefined;

        switch(opcode) {
            case Opcodes.HALT: opcodeBits = 0x0; break;
            case Opcodes.LOADI: opcodeBits = 0x1; break;
            case Opcodes.ADD: opcodeBits = 0x2; break;
            case Opcodes.REGDUMP: opcodeBits = 0x3; break;
            case Opcodes.PROMPTI: opcodeBits = 0x4; break;
            case Opcodes.CMP: opcodeBits = 0x5; break;
            case Opcodes.JLE: opcodeBits = 0x6; break;
            case Opcodes.JMP: opcodeBits = 0x7; break;
            case Opcodes.ADDI: opcodeBits = 0x8; break;
            case Opcodes.SUB: opcodeBits = 0x9; break;
            default: error(`Unknown opcode: ${opcode}`); break;
        }

        emit(opcodeBits, 1);
    }

    const emitInstruction = (instruction) => {
        nibblePosition = 1;
        compiledInstruction = 0xFFFF;
        emitOpcode(instruction.opcode);

        switch(instruction.opcode) {
            case Opcodes.HALT: break;
            case Opcodes.LOADI: {
                emitRegister(instruction.args[0]);
                emitImmediate(instruction.args[1]);

                break;
            }
            case Opcodes.ADD: {
                emitRegister(instruction.args[0]);
                emitRegister(instruction.args[1]);
                emitRegister(instruction.args[2]);

                break;
            }
            case Opcodes.REGDUMP: {
                emitRegister(instruction.args[0]);

                break;
            }
            case Opcodes.PROMPTI: {
                emitRegister(instruction.args[0]);

                break;
            }
            case Opcodes.CMP: {
                emitRegister(instruction.args[0]);
                emitRegister(instruction.args[1]);

                break;
            }
            case Opcodes.JLE: {
                emitJump(instruction.args[0]);

                break;
            }
            case Opcodes.JMP: {
                emitJump(instruction.args[0]);

                break;
            }
            case Opcodes.ADDI: {
                emitRegister(instruction.args[0]);
                emitImmediate(instruction.args[1]);

                break;
            }
            case Opcodes.SUB: {
                emitRegister(instruction.args[0]);
                emitRegister(instruction.args[1]);
                emitRegister(instruction.args[2]);

                break;
            }
            default: error(`Unrecognized opcode: ${instruction.opcode}`);
        }

        program.push(compiledInstruction);
    }

    instructions.forEach(emitInstruction);

    return program;
}

const compile = (source) => {
    const errors = [];

    const compileUntilErrors = () => {
        const tokens = tokenize(source, errors);
        if(errors.length > 0)
            return;

        const instructions = parse(tokens, errors);
        if(errors.length > 0)
            return;

        validate(instructions, errors);
        if(errors.length > 0)
            return;

        const program = emit(instructions, errors);
        if(errors.length > 0)
            return;

        return program;
    }

    const program = compileUntilErrors();

    return { program, errors };
}

module.exports = { compile, tokenize, parse };