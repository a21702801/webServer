//Importar express e Router
const express = require('express');
let router = express.Router();

//Importar cosias para lidar com passwords e gerar tokens
const bcrypt = require('bcrypt');
const randomString = require('randomstring');

//Importar coisas para fazer autentificação JWT
const jwt = require('jsonwebtoken')
const path = require('path');
require('dotenv').config({ path: path.join(__dirname,'../.env')});
let refreshTokens = [];

//Importar a api para fazer queries á base de dados
const pgApi = require('../database/pgApi.js');
const pgErrorHandler = require('../database/pgErrHand');

//Importar resources para enviar email de verificação
const mailerApi = require('../mailer/mailer_api');
const SERVER_DOMAIN = process.env.SERVER_DOMAIN;

// Registo
router.route('/register').post( async (req,res) => {

    let registerRequest = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            gender: req.body.gender,
            date_of_birth: req.body.date_of_birth.slice(0,10),
            email: req.body.email,
            password: req.body.password,
        };

    await pgApi.findUserByEmail(registerRequest.email, async (err,result) => {
        if(err !== undefined) {
            res.status(500).send('Server error.');
            return;
        }

        // Email not yet Registred
        if(result.length === 0){

            //Hash Password
            registerRequest.password  = await bcrypt.hash(registerRequest.password, 10);

            await pgApi.registerUser(registerRequest.email,registerRequest.first_name,registerRequest.last_name,registerRequest.date_of_birth,registerRequest.gender,registerRequest.password, async (err, result) => {

                if(err) {
                    res.status(500).send('Server Error.');
                }
                if(result) {
                    //Cretate info
                    const userId = result.rows[0].id

                    //Email Content
                    const text = 'Click here to verify your email: ' + SERVER_DOMAIN + '/auth/verify';

                    //Enviar email (SMTP)
                    //await mailer.sendVerificationEmail('admin@buddyabroad.com', registerRequest.email,'Please verify your email',text);

                    //Enviar email (API)
                    res.status(200).send({info:'Sending verification email'});
                    mailerApi.sendMailViaApi('Buddy Abroad <BuddyAbroad@mailgun.org>', registerRequest.email, 'Verify your account', text, userId, 1)

                }
            })
        } else {
            res.status(400).send('Email already in use.')
        }
    });
});

router.route('/resendVerificationEmail').post( async (req,res) => {
    const email = req.body.email;
    console.log(email)

    await pgApi.getPassworAndVerifiedByEmail(email, async (err, result) => {
        if (err) res.status(500).send('Server Error.');

        if (result) {
            console.log(result.rows[0])

            if (result.rows.length === 0) {
                res.status(400).send('Email not registered')
                return;
            }
            if (result.rows[0].verified === true) {
                res.status(400).send('Email already verified')
                return;
            }

            if (result.rows[0].verified === false) {
                const text = 'Click here to verify your email: ' + SERVER_DOMAIN + '/auth/verify';
                await mailerApi.sendMailViaApi('Buddy Abroad <BuddyAbroad@mailgun.org>', email, 'Verify your account', text, result.id, 1)
                res.status(200).send({info:'Sending verification email'});
            }


        }
    })
})

//Login
router.route('/login').post( async (req,res) => {
    const email = req.body.email

    await pgApi.getPassworAndVerifiedByEmail(email, async (err,result) => {
        if (err) {
            pgErrorHandler.parseError(err);
            res.status(500).send('Server Error.');
        }

        if ( result.rows.length === 0) {
            res.status(400).send('Email is not registered.')
            return;
        }
        if (result.rows[0].verified === true) {
            if (await bcrypt.compare(req.body.password,result.rows[0].password)) {

                const user = { email: req.body.email}
                const accessToken = generateAccessToken(user)
                const refreshToken = jwt.sign(user,process.env.REFRESH_TOKEN_SECRET)
                await pgApi.addRefreshToken(refreshToken, async (err,addResult) => {
                    if(err) pgErrorHandler.parseError(err)
                    if (res) {
                        refreshTokens.push(refreshToken)
                        console.log('accessToken: ', accessToken)
                        console.log('refreshToken: ',refreshToken)
                        res.status(200).send({email:email, accessToken: accessToken, refreshToken: refreshToken})
                        return
                    }
                });
            } else {
                res.status(400).send('Wrong Password')
                return
            }
        } else {
            res.status(400).send('Email is not verified.')
            return
        }
    })
})

//Gerar Access token
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' });
}

//Verificar Email
router.route('/verify/:id').get( async (req,res) => {
    const token =  req.params.id;
    await mailerApi.checkEmailValid(res,token, async () => {
        await pgApi.verifyUser(token, async (err, result) => {
            if (err) {
                pgErrorHandler.parseError(err);
                res.status(500).send('Server Error.');
            }
            if (result) {
                await pgApi.invalidateEmail(token, (err, result) => {
                    if (err) {
                        pgErrorHandler.parseError(err);
                        res.status(500).send('Server Error.');
                    }
                    if (result) {
                        res.status(200).send('Your account was verified');
                    }
                })
            }
        })
    })
});

module.exports = router;
