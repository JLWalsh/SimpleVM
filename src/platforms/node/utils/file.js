const fs = require('fs');

const readAsBytes = (file, buffer) => {
    const fileStats = fs.statSync(file);
    const fileDescriptor = fs.openSync(file, 'r');

    fs.readSync(fileDescriptor, buffer, 0, fileStats.size, 0);
    fs.closeSync(fileDescriptor);
};

const writeAsBytes = (file, bytes) => {
    const fileDescriptor = fs.openSync(file, 'w');

    const bytesWritten = fs.writeSync(fileDescriptor, bytes);
    fs.closeSync(fileDescriptor);
};

module.exports = { readAsBytes, writeAsBytes };