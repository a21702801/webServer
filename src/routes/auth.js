//Importar express e Router
const express = require('express');
let router = express.Router();
const pgErrorHandler = require('./pgErrHand');
const bcrypt = require('bcrypt');

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
            console.log(result.length)
            //Hash Password
            registerRequest.password  = await bcrypt.hash(registerRequest.password, 10)
            registerUser(registerRequest.email,registerRequest.first_name,registerRequest.last_name,registerRequest.date_of_birth,registerRequest.gender,registerRequest.password, (err, result) => {

                if(err) {
                    res.status(500).send('Server Error.')
                }
                if(result) {
                    res.status(200).send({info:"You signed up successfully"})
                }
            })
        } else {
            res.status(400).send('Email already in use.')
        }
    });
});

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

async function registerUser(email,firstName,lastName,
                            dateOfBirth,gender,password,callBack) {
    const sql = 'INSERT INTO users(email, first_name, last_name, gender, birth_date, password) VALUES ($1, $2, $3, $4, $5, $6)';
    pool.query(sql,[email,firstName,lastName,gender,dateOfBirth,
        password], (err, res) => {
            callBack(err,res)
    })
}

module.exports = router;