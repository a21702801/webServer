const express = require('express');
let router = express.Router();
const pgApi = require('../database/pgApi.js');
const pgErrorHandler = require('../database/pgErrHand');
const mailerApi = require('../mailer/mailer_api');
const path = require('path');
const bcrypt = require('bcrypt');
const moment = require('moment'); // require
const SERVER_DOMAIN = process.env.SERVER_DOMAIN;

router.route('/').get( async (req,res) =>{
    res.sendFile(__dirname + '/changePassword.html')
    const token =  req.params.token;
    console.log(token)
});

router.route('/page/:token').get( async (req,res) =>{
    const token = req.url.split('/')[2]
    console.log(token)
    await mailerApi.checkEmailValid(res,token, async () => {
        res.sendFile('changePassword.html', {root: path.join(__dirname, '/../views/')})
    })
});

router.route('/requestEmail').post(async (req,res) => {
    const email = req.body.email;
    await pgApi.getUserIdByEmail(email, (err,result) => {

        if(err !== undefined) {
            res.status(500).send('Server error.');
            return;
        }

        if(result.rows.length !== 0){

            //text
            const text = "Click here to change your password: " + SERVER_DOMAIN + "/forgotPassword/page";

            //Enviar email (API)
            res.status(200).send({info:'Sending email'});
            mailerApi.sendMailViaApi('Buddy Abroad <BuddyAbroad@mailgun.org>', email, 'Verify your account', text, result.rows[0].id, 2)

        } else {
            console.log('entrei no else')
            res.status(400).send('Email does not exist')
        }
    })
});

router.route('/changePassword').post( async (req,res) => {

    //parse body and hash password
    let password = await bcrypt.hash(req.body.password, 10);
    const token = req.body.token;

        await pgApi.invalidateEmail(token, async (err,result) => {
            if(err) {
                pgErrorHandler.parseError(err);
                res.status(500).send('Server Error.');
            }
            if(result) {

                await pgApi.changePasswordByToken(password,token,(err,result) => {

                    if (err !== undefined) {
                        pgErrorHandler.parseError(err)
                        res.status(500).send('Server Error')
                    }

                    if (result.rowCount === 0) {
                        res.status(400).send('Your email is not registred')
                    }

                    if (result.rowCount === 1) {
                        res.status(200).send('Your Password was changed')
                    }

                    console.log(result.rowCount);
                })
            }
        })
});

module.exports = router;

