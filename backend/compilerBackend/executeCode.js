const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const dirOutput = '/tmp'; // Use /tmp for Docker best practice

const executeCode = async (code, language, input = '') => {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    let filePath, outputFile, command, className;
    let filesToDelete = [];

    try {
        switch (language) {
            case 'c':
                filePath = path.join(dirOutput, `${jobId}.c`);
                outputFile = path.join(dirOutput, `${jobId}.out`);
                fs.writeFileSync(filePath, code);
                filesToDelete.push(filePath, outputFile);
                command = `gcc ${filePath} -o ${outputFile} 2>&1`;
                break;
            case 'cpp':
            case 'c++':
                filePath = path.join(dirOutput, `${jobId}.cpp`);
                outputFile = path.join(dirOutput, `${jobId}.out`);
                fs.writeFileSync(filePath, code);
                filesToDelete.push(filePath, outputFile);
                command = `g++ ${filePath} -o ${outputFile} 2>&1`;
                break;
            case 'java':
                filePath = path.join(dirOutput, `${jobId}.java`);
                fs.writeFileSync(filePath, code);
                filesToDelete.push(filePath);
                className = jobId;
                command = `javac ${filePath} 2>&1`;
                filesToDelete.push(path.join(dirOutput, `${className}.class`));
                break;
            case 'python':
            case 'python3':
                filePath = path.join(dirOutput, `${jobId}.py`);
                fs.writeFileSync(filePath, code);
                filesToDelete.push(filePath);
                command = null; // No compilation needed
                break;
            default:
                throw new Error('Unsupported language');
        }

        // Compilation step for compiled languages
        if (command) {
            await new Promise((resolve, reject) => {
                exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
                    if (error) {
                        return reject(new Error('compilation error: ' + stdout));
                    }
                    resolve();
                });
            });
        }

        // Execution step
        let runCmd;
        switch (language) {
            case 'c':
            case 'cpp':
            case 'c++':
                runCmd = `echo "${input}" | ${outputFile}`;
                break;
            case 'java':
                runCmd = `echo "${input}" | java -cp ${dirOutput} ${className}`;
                break;
            case 'python':
            case 'python3':
                runCmd = `echo "${input}" | python3 ${filePath}`;
                break;
        }

        return await new Promise((resolve, reject) => {
            exec(runCmd, { timeout: 5000 }, (error, stdout, stderr) => {
                if (error) {
                    if (error.killed) {
                        return reject('timeout');
                    }
                    if (stderr) {
                        return reject('runtime error: ' + stderr);
                    }
                    return reject('runtime error: ' + error.message);
                }
                if (stderr) {
                    return reject('runtime error: ' + stderr);
                }
                resolve(stdout.trim());
            });
        });
    } finally {
        // Cleanup: delete all generated files
        for (const file of filesToDelete) {
            try {
                if (fs.existsSync(file)) fs.unlinkSync(file);
            } catch (e) {
                // Ignore cleanup errors
            }
        }
    }
};

module.exports = {
    executeCode,
};