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
        text: `Cliquez sur le lien suivant pour réinitialiser votre mot de passe: ${link}. 
        
        Ce lien ne sera valide qu'une heure, passé ce délais, vous devrez demander un nouveau lien.
        
        Envoyé depuis MyEvents.
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Email sent: ' + info.response);
    });
} 

function sendInviteEmail(email, message) {
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
        subject: "MyEvents - Votre hôte souhaite vous faire part d'une information importante",
        text: `${message}


        Envoyé depuis MyEvents`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Email sent: ' + info.response);
    });
}

module.exports = {
    sendResetEmail,
    sendInviteEmail
}
