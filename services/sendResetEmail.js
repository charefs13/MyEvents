const nodemailer = require('nodemailer');

function sendResetEmail(email, link) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {

            user: 'auto.myevents@gmail.com',
            pass: 'wgzl nhzw cquw qmhi'
        }
    });

    const mailOptions = {
        from: 'auto.myevents@gmail.com',
        to: `${email}`,
        subject: 'Réinitialiser votre mot de passe',
        text: `cliquez sur le lien suivant pour réinitialiser votre mot de passe: ${link}, ce lien ne dure qu'une heure.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Email sent: ' + info.response);
    });
}

module.exports = { sendResetEmail }