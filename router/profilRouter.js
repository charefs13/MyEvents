const profilRouter = require('express').Router()
const bcrypt = require('bcrypt')
const authguard = require("../services/authguard")
const { PrismaClient } = require('@prisma/client');
const hashPasswordExtension = require("../services/hashPasswordExtension");
const prisma = new PrismaClient().$extends(hashPasswordExtension);
const crypto = require('crypto');
const { notificationEmail, sendContactEmail } = require('../services/sendResetEmail.js');



//affichage de ma page profil modifier les infos du profil
profilRouter.get('/profil', authguard, async (req, res) => {


    res.render('pages/profil.twig',
        {
            utilisateur: req.session.utilisateur,
        })
})

profilRouter.post('/updateUser', authguard, async (req, res) => {
    try {
        const { nom, prenom, genre, age, ville, adresse, cp } = req.body

        const updateUser = await prisma.utilisateur.update({
            where: {
                email: req.session.utilisateur.email
            },
            data: {
                nom: nom,
                prenom: prenom,
                age: parseInt(age),
                genre: genre,
                adresse: adresse,
                cp: parseInt(cp),
                ville: ville
            }
        })
        req.session.utilisateur = updateUser

        const objet = "Mise à jour de votre profil MyEvents – C’est tout bon !";

const message = `Bonjour ${req.body.nom} ${req.body.prenom},

Votre profil MyEvents a été mis à jour avec succès ! ✅

Si vous n'êtes pas à l'origine de cette modification, veuillez nous contacter immédiatement.

Besoin d’aide ? Notre équipe est là pour vous accompagner.

À bientôt sur MyEvents ! 🚀

L’équipe MyEvents  
📧 auto.myevents@gmail.com | 🌐 www.myevents.com`;

notificationEmail(req.body.email, message, objet);

        res.render('pages/profil.twig', {
            utilisateur: req.session.utilisateur,
            successMessage: " ✅ Les informations ont été correctement mises à jour !"
        })

    } catch (error) {
        console.log(error)
        res.render('pages/profil.twig', {
            errorMessage: "Une erreur est survenue lors de la modification."
        });
    }
})

profilRouter.get('/confirmDelete', authguard, (req, res) => {
    console.log(req.session.utilisateur)
    res.render('pages/confirmDelete.twig', {
        utilisateur: req.session.utilisateur
    }
    ) 
})

profilRouter.post('/deleteUser/:userId', authguard, async (req, res) => {
try {
    deletedUser = await prisma.utilisateur.delete({
        where: {
            id: parseInt(req.params.userId)
        }
    })

    const objet = "Votre compte MyEvents a bien été supprimé";

const message = `Bonjour,

Nous confirmons la suppression de votre compte MyEvents. 😢

Si cette action n’a pas été initiée par vous, contactez-nous immédiatement.

Nous espérons vous revoir bientôt ! En attendant, nous vous remercions d’avoir utilisé MyEvents.

L’équipe MyEvents  
📧 auto.myevents@gmail.com | 🌐 www.myevents.com`;
notificationEmail(req.session.utilisateur.email, message, objet);

req.session.destroy()
res.redirect("/")

} catch (error) {
    console.log(error)
    res.redirect('/') }

})
module.exports = profilRouter       