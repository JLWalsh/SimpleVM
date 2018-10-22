const fs = require('fs');
const readline = require('readline');
const createVM = require('../../core/vm');
const { readAsBytes } = require('./utils/file');

const file = process.argv[2];

console.log("Simple VM by James L. Walsh");

if(!file) {
    console.error("Usage: svm <file>.");
    return;
}

if(!fs.existsSync(file)) {
    console.error("Error: file not found.");
    return;
}

const promptImmediate = async () => {
    const rl = readline.createInterface(process.stdin, process.stdout);
    
    const question = new Promise((resolve) => {
        rl.question("Enter an immediate: ", (answer) => {
            resolve(answer);
        });
    });


    return question;
}

const writeImmediate = (immediate, register) => {
    console.log(`REGDUMP [reg${register}]: ${immediate}`);
}

const fileStats = fs.statSync(file);
const program = new Uint16Array(fileStats.size);

readAsBytes(file, program);

const run = async () => {
    const vm = createVM(promptImmediate, writeImmediate);
    const exitCode = await vm.runProgram(program);

    console.log(`Program exited with code ${exitCode}`);

    process.exit(exitCode);
}

run();