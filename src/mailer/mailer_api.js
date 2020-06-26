// API
const API_KEY = 'alterar';
const DOMAIN = 'alterar';
const mailgun = require('mailgun-js')({apiKey: API_KEY, domain: DOMAIN});

// Imports to create email info
const randomString = require('randomstring');
const moment = require('moment');

//Importar a api para fazer queries á base de dados
const pgApi = require('../database/pgApi.js');
const pgErrorHandler = require('../database/pgErrHand');

module.exports = {
    async sendMailViaApi(from, to, subject, text, userId, emailType) {

        const emailId = randomString.generate(64)
        const now = moment()
        console.log('now:',now)
        const expiresAt = now.add(1,'days')
        console.log('expireAt:',expiresAt)

        await pgApi.addEmail(emailId, userId,expiresAt, emailType, async (err, result) => {
            if(err) {
                pgErrorHandler.parseError(err);
                return { error: 'Server Error' }
            }

            if (result) {

                //Criar data para enviar email
                const data = {
                    from: from,
                    to: to,
                    subject: subject,
                    text: text + '/' + emailId
                };

                //Enviar Email
                mailgun.messages().send(data, (error, body) => {
                    if(err) return { error: 'Unable to send mail' }

                    if(body){
                        console.log(body)
                        return { success: 'Email sent' }
                    }
                });
            }
        })
    },

    async isEmailExpired(expiresAt, id) {
        const now = moment().startOf('day')
        const date = moment(expiresAt.slice(0, 10));
        const dif = date.diff(now, 'day');
        console.log(now)
        console.log(date)
        console.log(expiresAt)
        console.log(dif)
        if(dif < 0){
            await pgApi.invalidateEmail(id, async (err,result) => {
                if (err) {
                    pgErrorHandler.parseError(err);
                }
            })
            return true;
        }
        return false;
    },

    async checkEmailValid (res, token, callBack) {
        console.log(token)
        await pgApi.getEmailById(token, async (err,result) => {
            let error = false;
            if(err) {
                res.status(500).send('Server Error.');
                error = true;
            }
            if(result.rows.length === 0) {
                res.status(403).send('Invalid token');
                error = true;
            }
            if(result.rows[0].valid === false) {
                console.log('1',result.rows[0].valid )
                res.status(410).send('This link has expired :(');
                error = true;
            }
            if( await this.isEmailExpired(result.rows[0].expires_at.toJSON().toString(), token) === true){
                console.log('2')
                console.log(result.rows[0].expires_at)
                console.log(result.rows[0].expires_at.toJSON())
                console.log(result.rows[0].expires_at.toJSON().toString())
                res.status(410).send('This link has expired :(');
                error = true;
            }
            if(error === false) {
                callBack()
            }
        })
    }
};
