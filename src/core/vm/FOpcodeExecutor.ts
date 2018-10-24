import VM from "./VM";
import Instruction from "../common/Instruction";

type FOpcodeExecutor = (instruction: Instruction, vm: VM) => Promise<number> | number;

export default FOpcodeExecutor;