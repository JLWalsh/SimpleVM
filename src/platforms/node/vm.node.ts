import fs from 'fs';
import VM from "../../core/vm/VM";
import NodeVMIO from "./vm/NodeVMIO";
import ConsoleVMLogger from "../common/ConsoleVMLogger";
import FileUtils from './utils/FileUtils';

const vm = new VM(new NodeVMIO(), new ConsoleVMLogger());

const file = process.argv[2];

console.log("Simple VM by James L. Walsh");

const run = async (fileName: string) => {
    if (!file) {
        console.error("Usage: svm <file>.");
        return;
    }

    if (!fs.existsSync(file)) {
        console.error("Error: file not found.");
        return;
    }

    const fileStats = fs.statSync(file);
    const program = new Uint16Array(fileStats.size);

    FileUtils.readAsBytes(file, program);

    const exitCode = await vm.run(Array.from(program));

    console.log(`Program exited with code ${exitCode}`);

    process.exit(exitCode);
}

run(file);