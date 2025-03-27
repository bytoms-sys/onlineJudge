const express = require('express');
const cors = require('cors');
const { generateFile } = require('./generateFile.js');
const { executeCode } = require('./executeCode.js');


const router = express.Router();


router.use(cors());
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.get('/', (req, res) => {
  res.send('Welcome to Online compiler');
});

router.post('/compile', async (req, res) => {
    const { language , code } = req.body;
    if (!code) {
        return res.status(400).json({ message: 'Code is required' , status: false });
    }
    try {
        const filePath = await generateFile(language, code);
        const codeResult = await executeCode(filePath , language);
        res.status(200).json({ message: 'Code compiled successfully', filePath: filePath, output: codeResult });
    }
    catch (error) {
        res.status(500).json({ message: 'Error compiling code', error: error.message });
    }
});

module.exports = router;