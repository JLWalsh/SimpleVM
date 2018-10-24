const fs = require('fs');
const path = require('path');
const { compile, tokenize } = require('../../core/compiler');
const { writeAsBytes } = require('./utils/file');

const file = process.argv[2];
let destination = process.argv[3];

console.log("SimpleVM Compiler by James L Walsh.");

if(!file) {
    console.log("Usage: svmc <file>.");
    return;
}

if(!fs.existsSync(file)) {
    console.log("Error: file not found.");
    return;
}

const source = fs.readFileSync(file, 'UTF-8');

const { program, errors } = compile(source);

if(errors.length > 0) {
    errors.forEach(error => console.error(error + '\n'));
    console.error("Compilation aborted.");

    return;
} 

if(!destination) {
    const fileInfo = path.parse(file);
    destination = fileInfo.dir + "\\" + fileInfo.name + ".svm";

    console.log(`No destination file found.\nOutput will be named ${destination}`);
}

const programInBuffer = new Buffer(Uint16Array.from(program).buffer);
writeAsBytes(destination, programInBuffer);