var bunyan = require('bunyan');
var nodemailer = require('nodemailer');
var xoauth2 = require("xoauth2");

var Mailer = function() {

    this.template = "http://api.realsafe.io/Agent/Activate?agentemail={{email}}&activationkey={{activationkey}}";


};
//-------Mailer------------------------------------------------------------------------------------

Mailer.prototype.Transporter_Goddady = function() {
    var transporter = nodemailer.createTransport({
        host: 'smtpout.asia.secureserver.net',
        port: 465,
        auth: {
            user: 'support@realsafe.io',
            pass: 'Asap2021'
        },
        logger: bunyan.createLogger({
            name: 'nodemailer'
        }),
        debug: true // include SMTP traffic in the logs
      },
      {
        // default message fields

        // sender info
        from: 'realsafe <support@realsafe.io>',
        headers: {
            'X-Laziness-level': 1000 // just an example header, no need to use this
        }
    });
    return transporter;
};

Mailer.prototype.Transporter_Outlook = function() {
    var transporter = nodemailer.createTransport({
        service: 'Hotmail',
        auth: {
            user: 'zentomic@outlook.com',
            pass: 'Asap2021'
        },
        logger: bunyan.createLogger({
            name: 'nodemailer'
        }),
        debug: true // include SMTP traffic in the logs
    }, {
        // default message fields

        // sender info
        from: 'zentomic <zentomic@outlook.com>',
        headers: {
            'X-Laziness-level': 1000 // just an example header, no need to use this
        }
    });
    return transporter;

};

Mailer.prototype.Send = function(to, subject, activationKey, html) {

    var transporter = this.Transporter_Goddady();

    // Message object

    var link = this.template.split("{{email}}").join(to).split("{{activationkey}}").join(activationKey);
    var message = {
        // Comma separated list of recipients
        to: to,
        // Subject of the message
        subject: subject, //
        // plaintext body
        // plaintext body
        text: 'Zentomic activation. Link : ' + link,

        // HTML body
        html: 'Zentomic activation. Link : ' + link,
        // Apple Watch specific HTML body
        //watchHtml: '<b>Hello</b> to myself',
        // An array of attachments
        /*attachments: [

  ]*/
    };

    console.log('Sending Mail');

    // verify connection configuration
    transporter.verify(function(error, success) {
        if (error) {
            console.log(error);
        } else {
            console.log('Server is ready to take our messages');
            //--------------------------------------------------
            transporter.sendMail(message, function(error, info) {
                if (error) {
                    console.log('Error occurred');
                    console.log(error.message);
                    return;
                }
                console.log('Message sent successfully!');
                console.log('Server responded with "%s"', info.response);

                transporter.close();
            });
        }
    });
};
//------------------------------------------------------------------------------------------------
// create the model for users and expose it to our app
module.exports = Mailer;
