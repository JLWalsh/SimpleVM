import fs from 'fs';

class FileUtils {
    public static readAsBytes = (file: string, buffer: Uint16Array) => {
        const fileStats = fs.statSync(file);
        const fileDescriptor = fs.openSync(file, 'r');

        fs.readSync(fileDescriptor, buffer, 0, fileStats.size, 0);
        fs.closeSync(fileDescriptor);
    };

    public static writeAsBytes = (file: string, buffer: Buffer) => {
        const fileDescriptor = fs.openSync(file, 'w');

        const bytesWritten = fs.writeSync(fileDescriptor, buffer);
        fs.closeSync(fileDescriptor);
    };
}

export default FileUtils;