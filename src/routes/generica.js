const express = require('express');
let router = express.Router();

//Importar a api para fazer queries á base de dados
const pgApi = require('../database/pgApi.js');
const pgErrorHandler = require('../database/pgErrHand');

//Importar a api para enviar emails
const mailerApi = require('../mailer/mailer_api');

router.route('/').get( async (req,res) => {
    res.send('Acedeste á route genérica :D !')
});

router.route('/mail').get( async (req,res) => {

    res.send('A enviar email!')

    const from = 'Buddy Abroad <BuddyAbroad@mailgun.org>'
    const email = 'oTeuEmail@mail.com'
    const subject = 'Mail Generico'
    const text = 'Email enviado com a API!'
    const userId = 156
    const emailType = 1
    mailerApi.sendMailViaApi(from, email, subject, text, userId, emailType)

});

router.route('/jwt').get( async (req,res) => {
    jwtAuth.autenticateToken(req,res, () => {
        res.status(200).send({info: 'Accesso concedido :D!'})
    })
});
