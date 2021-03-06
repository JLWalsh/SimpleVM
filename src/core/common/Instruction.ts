import Opcode from "./Opcode";
import { JumpAddress, Register, Immediate } from "./VMTypes";

class Instruction {

    public readonly opcode: Opcode;
    public readonly reg1: Register;
    public readonly reg2: Register;
    public readonly reg3: Register;
    public readonly immediate: Immediate;
    public readonly jumpAddress: JumpAddress;

    public constructor({ opcode, reg1, reg2, reg3, immediate, jumpAddress }: 
                        { opcode: Opcode, reg1: Register, reg2: Register, reg3: Register, immediate: Immediate, jumpAddress: JumpAddress }) {
        this.opcode = opcode;
        this.reg1 = reg1;
        this.reg2 = reg2;
        this.reg3 = reg3;
        this.immediate = immediate;
        this.jumpAddress = jumpAddress;
    }
}

export default Instruction;
