const nodemailer = require('nodemailer');
require('dotenv').config(); // Charger les variables d'environnement

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Fonction d'envoi de l'email de réinitialisation
function sendResetEmail(email, link) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Réinitialiser votre mot de passe',
        text: `Cliquez sur le lien suivant pour réinitialiser votre mot de passe: ${link}. 
        
        Ce lien ne sera valide qu'une heure, passé ce délai, vous devrez demander un nouveau lien.

        Bien Cordialement,

        L'équipe MyEvents.
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email envoyé: ' + info.response);
        }
    });
}

// Fonction d'envoi d'une invitation
function sendInviteEmail(email, message) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "MyEvents - Votre hôte souhaite vous faire part d'une information importante",
        text: `${message}

        Bien Cordialement,

        L'équipe MyEvents.
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email envoyé: ' + info.response);
        }
    });
}

// Fonction d'envoi du formulaire de contact
function sendContactEmail(nom, prenom, email, message) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Envoi à l'email MyEvents
        subject: "MyEvents - Un utilisateur souhaite vous contacter",
        text: `
        Bonjour,

        Un utilisateur souhaite vous contacter depuis MyEvents.

        Nom: ${nom} 
        Prénom: ${prenom} 
        Email: ${email}

        Message : 

        ${message}

        Bien Cordialement,

        L'équipe MyEvents.
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email envoyé: ' + info.response);
        }
    });
}

// Fonction d'envoi de notifications par email
function notificationEmail(email, message, objet) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: objet,
        text: `${message}

        Envoyé depuis MyEvents.
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email envoyé: ' + info.response);
        }
    });
}

module.exports = {
    sendResetEmail,
    sendInviteEmail,
    sendContactEmail,
    notificationEmail
};
