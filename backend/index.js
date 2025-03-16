const express = require('express');
const { DBconnection } = require('./database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./model/User');
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
        //check all the data is present or not which is given by user
        //find the user with the email in the database
        //compare the password with the password in the database
        //store cookie and send the token
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