// const fs = require('fs');
// const path = require('path');
// const { exec } = require('child_process');

// const dirOutput = path.join(__dirname, 'outputs');
// if (!fs.existsSync(dirOutput)) {
//     fs.mkdirSync(dirOutput);
// }

// const executeCode = async (code, language, input = '') => {
//     const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
//     let filePath, outputFile, command, className;
//     let filesToDelete = [];

//     try {
//         switch (language) {
//             case 'c':
//                 filePath = path.join(dirOutput, `${jobId}.c`);
//                 outputFile = path.join(dirOutput, `${jobId}.out`);
//                 fs.writeFileSync(filePath, code);
//                 filesToDelete.push(filePath, outputFile);
//                 command = `gcc ${filePath} -o ${outputFile} 2>&1`;
//                 break;
//             case 'cpp':
//                 filePath = path.join(dirOutput, `${jobId}.cpp`);
//                 outputFile = path.join(dirOutput, `${jobId}.out`);
//                 fs.writeFileSync(filePath, code);
//                 filesToDelete.push(filePath, outputFile);
//                 command = `g++ ${filePath} -o ${outputFile} 2>&1`;
//                 break;
//             case 'java':
//                 filePath = path.join(dirOutput, `${jobId}.java`);
//                 fs.writeFileSync(filePath, code);
//                 filesToDelete.push(filePath);
//                 className = jobId;
//                 command = `javac ${filePath} 2>&1`;
//                 // Java .class file will be created after compilation
//                 filesToDelete.push(path.join(dirOutput, `${className}.class`));
//                 break;
//             case 'python':
//             case 'python3':
//                 filePath = path.join(dirOutput, `${jobId}.py`);
//                 fs.writeFileSync(filePath, code);
//                 filesToDelete.push(filePath);
//                 command = null; // No compilation needed
//                 break;
//             default:
//                 throw new Error('Unsupported language');
//         }

//         // Compilation step for compiled languages
//         if (command) {
//             await new Promise((resolve, reject) => {
//                 exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
//                     if (error) {
//                         return reject(new Error('compilation error: ' + stdout));
//                     }
//                     resolve();
//                 });
//             });
//         }

//         // Execution step
//         let runCmd;
//         switch (language) {
//             case 'c':
//             case 'cpp':
//                 runCmd = `echo "${input}" | ${outputFile}`;
//                 break;
//             case 'java':
//                 runCmd = `echo "${input}" | java -cp ${dirOutput} ${className}`;
//                 break;
//             case 'python':
//             case 'python3':
//                 runCmd = `echo "${input}" | python3 ${filePath}`;
//                 break;
//         }

//         return await new Promise((resolve, reject) => {
//             exec(runCmd, { timeout: 5000 }, (error, stdout, stderr) => {
//                 if (error) {
//                     if (error.killed) {
//                         return reject('timeout');
//                     }
//                     if (stderr) {
//                         return reject('runtime error: ' + stderr);
//                     }
//                     return reject('runtime error: ' + error.message);
//                 }
//                 if (stderr) {
//                     return reject('runtime error: ' + stderr);
//                 }
//                 resolve(stdout);
//             });
//         });
//     } finally {
//         // Cleanup: delete all generated files
//         for (const file of filesToDelete) {
//             try {
//                 if (fs.existsSync(file)) fs.unlinkSync(file);
//             } catch (e) {
//                 // Ignore cleanup errors
//             }
//         }
//     }
// };

// module.exports = {
//     executeCode,
// };

const Docker = require('dockerode');
const docker = new Docker();

const executeCode = async (code, language, input = '') => {
    let imageName, runCmd;
    console.log('Input being passed:', input);
    if (input && !input.endsWith('\n')) input += '\n';
    
    switch (language.toLowerCase()) {
        case 'python':
        case 'python3':
            imageName = 'onlinejudge-python';
            const codeBase64 = Buffer.from(code).toString('base64');
            //runCmd = `echo "${codeBase64}" | base64 -d > /app/code.py && printf "${input}" | python3 /app/code.py`;
            runCmd = `echo "${codeBase64}" | base64 -d > /tmp/code.py && printf "${input}" | python3 /tmp/code.py`;
            break;
        case 'java':
            imageName = 'onlinejudge-java';
            //runCmd = `echo "${code}" > /app/Main.java && javac /app/Main.java && printf "${input}" | java -cp /app Main`;
            runCmd = `echo "${code}" > /tmp/Main.java && javac /tmp/Main.java && printf "${input}" | java -cp /tmp Main`;
            break;
        case 'cpp':
        case 'c++':
            imageName = 'onlinejudge-cpp';
            const cppCodeBase64 = Buffer.from(code).toString('base64');
            //runCmd = `echo "${cppCodeBase64}" | base64 -d > /app/code.cpp && g++ /app/code.cpp -o /app/program && printf "${input}" | /app/program`;
            runCmd = `echo "${cppCodeBase64}" | base64 -d > /tmp/code.cpp && g++ /tmp/code.cpp -o /tmp/program && printf "${input}" | /tmp/program`;
            break;
        case 'c':
            imageName = 'onlinejudge-c';
            const cCodeBase64 = Buffer.from(code).toString('base64');
            //runCmd = `echo "${cCodeBase64}" | base64 -d > /app/code.c && gcc /app/code.c -o /app/program && printf "${input}" | /app/program`;
            runCmd = `echo "${cCodeBase64}" | base64 -d > /tmp/code.c && gcc /tmp/code.c -o /tmp/program && printf "${input}" | /tmp/program`;
            break;
        default:
            throw new Error('Unsupported language');
    }
    
    console.log('runCmd:', runCmd);
    
    console.log('Creating container...');
    const container = await docker.createContainer({
        Image: imageName,
        Cmd: ['/bin/sh', '-c', runCmd],
        AttachStdout: true,
        AttachStderr: true,
        HostConfig: {
            AutoRemove: false,
            Memory: 128 * 1024 * 1024,
            NetworkMode: 'none',
            SecurityOpt: [
            'no-new-privileges:true'
            //'seccomp:/Users/shovnapanda/Documents/online-judge/backend/security-profiles/judge-seccomp.json'
            // Note: AppArmor isn't available on macOS, only use on Linux
        ],
            ReadonlyRootfs: true,
            Binds: ['/tmp:/tmp:rw'],
            PidsLimit: 50,
        },
        WorkingDir: '/tmp'
    });
    
    console.log('Container created.');
    await container.start();
    console.log('Container started.');
    
    console.log('Waiting for container to finish...');
    const waitPromise = container.wait();
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 30000));
    
    let result;
    try {
        result = await Promise.race([waitPromise, timeoutPromise]);
        console.log('Result object:', result);
    } catch (err) {
        console.error('Error or timeout:', err);
        throw err;
    }
    
    console.log('Getting logs...');
const logs = await container.logs({
    follow: false,
    stdout: true,
    stderr: true
});

// Add this demultiplexing code
let output = '';
if (Buffer.isBuffer(logs)) {
    // Docker multiplexed logs: first byte is stream type, next 3 bytes are padding
    // next 4 bytes are payload length, then the actual payload follows
    let i = 0;
    while (i < logs.length) {
        // Skip the header (8 bytes)
        if (i + 8 <= logs.length) {
            const payloadLength = logs.readUInt32BE(i + 4);
            if (i + 8 + payloadLength <= logs.length) {
                const payload = logs.slice(i + 8, i + 8 + payloadLength);
                output += payload.toString('utf8');
                i += 8 + payloadLength;
            } else {
                break;
            }
        } else {
            break;
        }
    }
} else {
    output = logs.toString('utf8');
}

console.log('Output:', output);
    
    // Clean up container
    await container.remove();
    
    return output;
};

module.exports = {
    executeCode
};