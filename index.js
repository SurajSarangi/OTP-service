require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const PORT = process.env.PORT;
const generateOTP = require('./otpGen');
const info = require('./info');
const mongoose = require('mongoose');
const OTP = require('./models/otps');

const dbURI = process.env.DBURI;
mongoose
    .connect(dbURI, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(r => app.listen(PORT , () => console.log(`Listening to requests on http://localhost:${PORT}`)))
    .catch(err => console.log(err));


app.use(cors());
app.use(bodyParser.json());

app.use((req,res,next) => {
    info(req);
    next();
});

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
    
    let OTPgen = 54123 || generateOTP();

    const otpservice = new OTP({
        email : req.body.email,
        otp : OTPgen,
        verified : false
    });
    otpservice
        .save()
        .then(() => console.log(`DB updated for ${req.body.email} with ${OTPgen}`));

    let mailOptions = {
        from: process.env.MAIL,
        to: req.body.email,
        subject: 'Automated Email using Node.JS',
        html: `OTP for <strong>${req.body.email}</strong> is <h1>${OTPgen}</h1>`
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
        res
            .status(200)
            .end(JSON.stringify({
                status: 200,
                message: "OTP verified Successfully"
            }));
    } else {
        res
            .status(404)
            .end(JSON.stringify({
                status: 404,
                message: "OTP Verification Failed"
            }));
    }
});