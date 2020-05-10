var API_KEY = 'key-81db90c184e63fcfb434d1e13f39a06a';
var DOMAIN = 'sandbox7145092385644a54b06f3ca9e3eb9e5d.mailgun.org';
var mailgun = require('mailgun-js')({apiKey: API_KEY, domain: DOMAIN});

module.exports = {
    sendMailViaApi(data) {
        mailgun.messages().send(data, (error, body) => {
            console.log(body);
        });
    }
};
