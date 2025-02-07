const profilRouter = require('express').Router()
const bcrypt = require('bcrypt')
const authguard = require("../services/authguard")
const { PrismaClient } = require('@prisma/client');
const hashPasswordExtension = require("../services/hashPasswordExtension");
const prisma = new PrismaClient().$extends(hashPasswordExtension);
const crypto = require('crypto');
const { sendResetEmail } = require('../services/sendResetEmail.js');



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
        res.render('pages/profil.twig', {
            utilisateur: req.session.utilisateur,
            successMessage: "Les informations ont été correctement mises à jour !"
        })

    } catch (error) {
        console.log(error)
        res.render('pages/profil.twig', {
            errorMessage: "Une erreur est survenue lors de la modification."
        });
    }
})

profilRouter.get('/confirmDelete', authguard, (req, res) => {
    res.render('pages/confirmDelete.twig', {
        utilisateur: req.session.utilisateur
    }
    ) 
})

profilRouter.get('/deleteUser', authguard, async (req, res) => {
    deletedUser = await prisma.utilisateur.delete({
        where: {
            email: req.session.utilisateur.email
        }
    })
    req.session.destroy()
    res.redirect("/")
})
module.exports = profilRouter       