const express = require('express');
const { DBconnection } = require('./database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./model/User');
const cookieParser = require('cookie-parser');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
DBconnection();

app.get('/', (req, res) => {
  res.send('Hello World! This is home page');
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
        const { firstName, lastName, email, password } = req.body;
        
        //check all the data is present or not which is given by user
        if(!firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: 'All fields are required', status: false });
        }

        //check the email is already present in the database or not
        const emailExist = await User.findOne({
            email: email
        });
        if(emailExist) {
            return res.status(400).json({ error: 'Email already exists', status: false });
        }
        //encrypt the password
        const hashPassword = await bcrypt.hash(password, 10);
        //store the data in DB
        const user = await User.create({
            firstName,
            lastName,
            email,
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