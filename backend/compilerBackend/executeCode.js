const fs =  require('fs');
const path = require('path');
const { exec } = require('child_process');

const dirOutput = path.join(__dirname, 'outputs');

if(!fs.existsSync(dirOutput)) {
    fs.mkdirSync(dirOutput);
}

const executeCode = async (filePath, language) => {
    try { 
        const jobId = path.basename(filePath).split('.')[0];
        //console.log('Job ID:', jobId);
        const outputFile = path.join(dirOutput, `${jobId}.out`);
        // console.log('Output File Path:', outputFilePath);
        // const outputFile = path.join(outputFilePath, `.out`);
        // console.log('Output File:', outputFile);
        console.log('File Path:', filePath);
        console.log('Language:', language);

        let command = '';
        switch(language) {
            case 'c':
                command = `gcc ${filePath} -o ${outputFile} && cd ${dirOutput} && ./${jobId}.out`;
                break;
            case 'cpp':
                command = `g++ ${filePath} -o ${outputFile} && cd ${dirOutput} && ./${jobId}.out`;
                break;
            case 'java':
                //const dirPath = path.dirname(filePath);
                //console.log('Dir Path:', dirPath);
                //const className = path.basename(filePath, '.java');
                //console.log('Class Name:', className);
                //command = `javac ${filePath} && java -cp ${dirPath} ${className}`;
                command = `java ${filePath}`;
                console.log('Command:', command);
                break;
            case 'python':
                command = `python ${filePath}`;
                break;
            case 'python3':
                command = `python3 ${filePath}`;
                break;
            default:
                command = '';
        }

        //command = `g++ ${filePath} -o ${outputFile} && cd ${dirOutput} && ./${jobId}.out`

        return new Promise((resolve, reject) => {
            exec(command , (error, stdout, stderr) => {
                if (error) {
                    console.log('Error executing code', error.message);
                    reject(error);
                }
                if (stderr) {
                    console.log('Error executing code', stderr);
                    reject(stderr);
                }
                resolve(stdout);
            });
        }
        );
        
    }
    catch (error) {
        console.log('Error executing code', error.message);
    }


}

module.exports = {
    executeCode,
};