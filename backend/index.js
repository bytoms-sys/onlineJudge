const express = require('express');
const { DBconnection } = require('./database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./model/User');
const cookieParser = require('cookie-parser');
const Problem = require('./model/Problem');

const compilerRoutes = require('./compilerBackend/compilerBackend.js');
const submissionRoutes = require('./submissions/submissionRoutes.js');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
DBconnection();

app.get('/', (req, res) => {
  res.send('Welcome to Online compiler');
});

app.use('/compiler', compilerRoutes);

app.use('/submission', submissionRoutes);

//definining the problems routes
app.post('/problems', async (req, res) => {
    //console.log(req.body);
    try {
        const { title, description, difficulty, tags, inputFormat, outputFormat, constraints, problemCode } = req.body;
        //console.log("In try block");
        //console.log(req.body.problemCode);
        // Ensure all required fields are provided
        if (!title || !description || !difficulty || !inputFormat || !outputFormat || !problemCode || !req.body.sampleTestCases || !req.body.testCases ) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        //console.log("In try block2");
        let sampleTestCases, testCases;
        try {
            sampleTestCases = typeof req.body.sampleTestCases === "string" ? JSON.parse(req.body.sampleTestCases) : req.body.sampleTestCases;
            testCases = typeof req.body.testCases === "string" ? JSON.parse(req.body.testCases) : req.body.testCases;
        } catch (error) {
            return res.status(400).json({ message: 'Invalid JSON format for test cases', error: error.message });
        }
        const tagsArray = typeof tags === "string" ? tags.split(",").map(tag => tag.trim()) : tags;
        //console.log("In try block3");
        const problemExist = await Problem.findOne({
            problemCode: problemCode
        });
        if(problemExist) {
            return res.status(400).json({ error: 'Problem already exists', status: false });
        }

        const problem = await Problem.create({
            title, description, difficulty, tags, inputFormat, outputFormat, sampleTestCases, testCases, constraints, problemCode
        });

        //const newProblem = new Problem({ title, description, difficulty, tags, inputFormat, outputFormat, sampleTestCases, testCases, constraints, createdBy });
        //await newProblem.save();

        res.status(201).json({ message: 'Problem created successfully', problem: problem });
    } catch (error) {
        res.status(500).json({ message: 'Error creating problem', error: error.message });
    }
});

app.get('/problems', async (req, res) => {
    try {
        const problems = await Problem.find();
        res.status(200).json(problems);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching problems', error: error.message });
    }
});

app.get('/problems/:problemCode', async (req, res) => {
    try {
        const problem = await Problem.findOne({ problemCode: req.params.problemCode });
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        res.status(200).json(problem);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching problem', error: error.message });
    }
});

app.put('/problems/:problemCode', async (req, res) => {
    try {
        let { sampleTestCases, testCases } = req.body;
        try {
            sampleTestCases = typeof sampleTestCases === "string" ? JSON.parse(sampleTestCases) : sampleTestCases;
            testCases = typeof testCases === "string" ? JSON.parse(testCases) : testCases;
        } catch (error) {
            return res.status(400).json({ message: 'Invalid JSON format for test cases', error: error.message });
        }
        const problem = await
        Problem.findOneAndUpdate({ problemCode: req.params.problemCode }, { ...req.body, sampleTestCases, testCases },
        { new: true , runValidators: true });
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        res.status(200).json({ message: 'Problem updated successfully', problem: problem });
    } catch (error) {
        res.status(500).json({ message: 'Error updating problem', error: error.message });
    }
});

app.delete('/problems/:problemCode', async (req, res) => {
    try {
        const deletedProblem = await Problem.findOneAndDelete({ problemCode: req.params.problemCode });
        if (!deletedProblem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        res.status(200).json({ message: 'Problem deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting problem', error: error.message });
    }
});

// app.get('/login', (req, res) => {
//   res.send('Hello World! This is login page');
// });

app.post('/login', async (req, res) => {
    try {
        //get all the data from the request/frontend/ui/web
        const { email, password } = req.body;
        //check all the data is present or not which is given by user
        if(!email || !password) {
            return res.status(400).json({ error: 'All fields are required', status: false });
        }
        //find the user with the email in the database
        const emailExist = await User.findOne({
            email: email
        });
        if(emailExist)
        {
            if (emailExist.email === email) {
                //compare the password   with the password in the database
                const hash = emailExist.password;
                const isMatch = await bcrypt.compare(password, hash);
                console.log(isMatch);
                if(!isMatch) {
                    return res.status(400).json({json: 'Invalid credes', status: false});
                }
                else {
                    //store cookie and send the token
                    const token = jwt.sign({ id: emailExist._id, email: emailExist.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
                    res.cookie("token", token, {
                        httpOnly: true, // Prevents JavaScript access (XSS protection)
                        secure: process.env.NODE_ENV === "production", // Only sends over HTTPS in production
                        sameSite: "Strict", // CSRF protection
                        maxAge: 24 * 60 * 60 * 1000 // 24 hours expiration
                    });
                    return res.status(200).json({ message: 'Login successful', status: true });
                }
            }
        } else {
            console.log('Email doesn\'t Exist');
            return res.status(400).json({ error: 'Email doesn\'t exist! Please register', status: false });
        }
    }
    catch (error) {
        res.send('Error in login route');
    }
});

app.post('/register', async (req, res) => {
    //res.send('Hello World! This is register page');
    try {
        //get all the data from the request/frontend/ui/web
        const { firstName, lastName, email, password, role } = req.body;
        
        //check all the data is present or not which is given by user
        if(!firstName || !lastName || !email || !password || !role ) {
            return res.status(400).json({ error: 'All fields are required', status: false });
        }

        //check the email is already present in the database or not
        const emailExist = await User.findOne({
            email: email
        });
        if(emailExist) {
            return res.status(400).json({ error: 'Email already exists, Please login!!', status: false });
        }
        //encrypt the password
        const hashPassword = await bcrypt.hash(password, 10);
        //store the data in DB
        const user = await User.create({
            firstName,
            lastName,
            email,
            role,
            password: hashPassword
        });
        //generate a token for the user and send it to the user
        const token = jwt.sign({ id : user._id, email}, process.env.JWT_SECRET, {
            expiresIn: '24h'
        });
        user.token = token;
        user.password = undefined;
        res.status(200).json({ message: 'User registered successfully', status: true ,user });
    }   
    catch (error) {
        res.send('Error in registration route');
    }
  });

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});