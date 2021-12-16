require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const PORT = process.env.PORT;
const generateOTP = require('./otpGen');

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, '/form.html'));
});

app.post('/send', (req, res) => {
    
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.MAIL,
          pass: process.env.PASSWORD
        }
    });
    
    let OTP = 54123 || generateOTP();

    let mailOptions = {
        from: process.env.MAIL,
        to: req.body.email,
        subject: 'Automated Email using Node.JS',
        html: `OTP for <strong>${req.body.email}</strong> is <h1>${OTP}</h1>`
    };
    
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
            res
                .status(404)
                .end(JSON.stringify({
                    status: 404,
                    message: error
            }));
        } else {
            console.log('Email sent: ' + info.response);
            res
                .status(302)
                .end(JSON.stringify({
                    status:302,
                    message:"Email Sent."
                }))
        }
    });
})

app.get('/verify', (req,res) => {
    res.sendFile(path.join(__dirname, '/verify.html'));
})

app.post('/verify', (req,res) => {
    if( parseInt(req.body.OTP) === 54123){
        res.status(200).end(JSON.stringify({
            status: 200,
            message: "OTP verified Successfully"
        }));
    } else {
        res.status(404).end(JSON.stringify({
            status: 404,
            message: "OTP Verification Failed"
        }));
    }
})

app.listen(PORT , () => {
    console.log(`Listening to requests on http://localhost:${PORT}`);
});