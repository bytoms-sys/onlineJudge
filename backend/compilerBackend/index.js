const express = require('express');
const { executeCode } = require('./executeCode');
const app = express();
app.use(express.json());

app.post('/run-cpp', async (req, res) => {
    const { code, input } = req.body;
    try {
        const output = await executeCode(code, 'cpp', input);
        res.json({ output });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(8000, '0.0.0.0', () => {
    console.log('C++ judge service running on port 8000');
});