var API_KEY = 'bf0308f7611f56e92d9d875c775fbc6b-65b08458-f5199fb8';
var DOMAIN = 'sandbox7145092385644a54b06f3ca9e3eb9e5d.mailgun.org';
var mailgun = require('mailgun-js')({apiKey: API_KEY, domain: DOMAIN});

const data = {
    from: 'Buddy Abroad <diogoazevedo15@gmail.com>',
    to: 'foo@example.com, bar@example.com',
    subject: 'Hello',
    text: 'Testing some Mailgun awesomeness!'
};

module.exports = {
    sendMailViaApi(data) {
        mailgun.messages().send(data, (error, body) => {
            console.log(body);
        });
    }
};
