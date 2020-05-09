//Importar express e Router
const express = require('express');
let router = express.Router();
const pgErrorHandler = require('./pgErrHand');
const bcrypt = require('bcrypt');
const randomString = require('randomstring');

//Importar a classe Pool
const {Pool} = require('pg');

//Criar Client para fazer conexão com a pg database
const pool = new Pool({
    user: "DiogoAzevedo",
    password: "1234",
    host: "localhost",
    port: 5432,
    database: "buddyAbroad",
    max: 20,
    _connectionTimeoutMillis: 0,
    idleTimeoutMillis: 10000
});

//Importar resources para enviar email de verificação
const mailerApi = require('../misc/mailer/mailer_api');


router.route('/register').post( async (req,res) =>{

    let registerRequest = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            gender: req.body.gender,
            date_of_birth: req.body.date_of_birth.slice(0,10),
            email: req.body.email,
            password: req.body.password,
        };

    await findUserByEmail(registerRequest.email, async (err,result) =>{

        if(err !== undefined) {
            res.status(500).send('Server error.');
            return;
        }

        // Email not yet Registred
        if(result.length === 0){
            console.log(result.length);
            //Hash Password
            registerRequest.password  = await bcrypt.hash(registerRequest.password, 10);
            //Gerar secret token (32 long)
            const secretToken = randomString.generate();
            registerUser(registerRequest.email,registerRequest.first_name,registerRequest.last_name,registerRequest.date_of_birth,registerRequest.gender,registerRequest.password,secretToken, async (err, result) => {

                if(err) {
                    res.status(500).send('Server Error.');
                }
                if(result) {
                    res.status(200).send({info:"Verification email sent"});

                    //Email Content
                    const text = "Click here to verify your email: http://localhost:3000/auth/verify/" + secretToken;

                    //Enviar email
                    //await mailer.sendVerificationEmail('admin@buddyabroad.com', registerRequest.email,'Please verify your email',text);

                    const data = {
                        from: 'Buddy Abroad <BuddyAbroad@mailgun.org>',
                        to: registerRequest.email,
                        subject: 'Verify your account',
                        text: text
                    };
                    mailerApi.sendMailViaApi(data)


                }
            })
        } else {
            res.status(400).send('Email already in use.')
        }
    });
});

router.route('/verify/:id').get( async (req,res) =>{
    const token =  req.params.id;
    console.log(token);
    verifyUser(token, (err,result) => {
        if(err) {
            pgErrorHandler.parseError(err);
            res.status(500).send('Server Error.');
        }
        if(result) {
            res.status(200).send("Your account was verified");
        }
    })
});

async function verifyUser(token,callBack) {

    const sql = "UPDATE public.users SET verified= '1'  WHERE secret_token = $1";
    pool.query(sql, [token], (err, res) => {
        callBack(err,res)
    })
}

async function findUserByEmail(email,callBack) {

    const sql = 'SELECT * FROM users  WHERE email = $1 limit 1';
    pool.query(sql, [email], (err, res) => {

        if(err !== undefined) {
            pgErrorHandler.parseError(err);
            callBack(err,res)
        }
        if (res) {
            //Return rows
            console.table(res.rows)
            callBack(err,res.rows)
        }
    })
}

async function registerUser(email,firstName,lastName, dateOfBirth,gender,password,secretToken,callBack) {
    const sql = 'INSERT INTO users(email, first_name, last_name, gender, birth_date, password, secret_token) VALUES ($1, $2, $3, $4, $5, $6, $7)';

    pool.query(sql,[email,firstName,lastName,gender,dateOfBirth,password,secretToken], (err, res) => {
            callBack(err,res)
    })
}

module.exports = router;
