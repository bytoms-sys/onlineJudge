const fs =  require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dirCode = path.join(__dirname, 'code');

if(!fs.existsSync(dirCode)) {
    fs.mkdirSync(dirCode);
}

const generateFile = async (language, code) => {
    const jobId = uuidv4();
    const filePath = path.join(dirCode, `${jobId}.${language}`);
    await fs.writeFileSync(filePath, code);
    return filePath;
}

module.exports = {
    generateFile,
};
