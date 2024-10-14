const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const md5 = require('md5');
const bcrypt = require('bcrypt');
const saltRounds = 12;

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

mongoose.set('strictQuery', false);

mongoose.connect('mongodb://127.0.0.1:27017/userDB');

const userSchema = mongoose.Schema({
    email : String,
    password : String
});

const User = mongoose.model("User", userSchema);

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {

    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        const newUser = new User({
            email : req.body.username,
            password : hash
        });
        newUser.save((err) => {
            if (err) return console.log(err);
            else res.render('secrets');
        });
    });

});

app.post('/login', (req, res) => {
    const id = req.body.username;
    const pass = req.body.password;
User.findOne({email : id}, (err, doc) => {
    if (err) res.send(err);
    else {
        bcrypt.compare(pass, doc.password, (err, result) => {
            if(result == true) {
                res.render('secrets');
            }
            else {
                res.send("Username and Password don't match.");
            }
        } );
        }
});
});

app.listen(3000, () => console.log('Server started at Port 3000'));
