const prosRouter = require('express').Router()
const bcrypt = require('bcrypt')
const authguard = require("../services/authguard")
const { PrismaClient } = require('@prisma/client');
const hashPasswordExtension = require("../services/hashPasswordExtension");
const prisma = new PrismaClient().$extends(hashPasswordExtension);


//  affichage de la page d'inscription pour une Entreprise
prosRouter.get('/signInPros', (req, res) => {
    res.render('pages/signInPros.twig',
        utilisateur
    )
})

// Envoie du formulaire d'inscription à ma BDD
prosRouter.post('/signInPros', async (req, res) => {
    try {
        if (req.body.password === req.body.confirmPassword) {
            const pros = await prisma.utilisateur.create({
                data: {
                    nom: req.body.nom,
                    prenom: req.body.prenom,
                    email: req.body.email,
                    password: req.body.password,
                    isEntreprise: true
                }

            })
            res.redirect('/login')
        }
        else throw ({ confirmMdp: "Vos mots de passe ne correspondent pas" })
    } catch (error) {

        res.render('pages/signInPros.twig', {
            error: error
        })
    }
})



prosRouter.get('/addProfilPros', async (req, res) => {
    try {
        // Récupérer l'utilisateur à partir de la base de données
        const utilisateur = await prisma.utilisateur.findFirst({
            where: {
                email: req.session.utilisateur.email
            }
        });

        res.render('pages/addProfilPros.twig', {
            utilisateur: utilisateur
        });

    } catch (error) {
        console.error(error);
        res.render('pages/addProfilPros.twig')
    }
});





// Envoie de mon formulaire ajout profil pour créer une Entreprise
prosRouter.post('/addProfilPros/:id', authguard, async (req, res) => {
    try {
        const entreprise = await prisma.entreprise.create({
            data: {
                raisonSociale: req.body.raisonSociale,
                siret: req.body.siret,
                type: req.body.type,
                adresse: req.body.adresse,
                cp: parseInt(req.body.cp),
                ville: req.body.ville,
                utilisateurId: parseInt(req.session.utilisateur.id)
            }
        })

        const updatedUtilisateur = await prisma.utilisateur.update({
            where: {
                id: parseInt(req.params.id)
            },
            data: {
                adresse: req.body.adresse,
                cp: parseInt(req.body.cp),
                ville: req.body.ville
            }
        })
        req.session.entreprise = entreprise
        req.session.utilisateur = updatedUtilisateur
        res.redirect('/dashboardPros')
    } catch (error) {
        console.log(error)
        res.render('pages/addProfilPros.twig', {
            error: { error: "une erreur est survenue" }
        })
    } 
})

prosRouter.get('/dashboardPros', (req, res) => {
    console.log(req.session.utilisateur)
    res.render('pages/dashboardPros.twig',
        {
            utilisateur: req.session.utilisateur,
            entreprise: req.session.entreprise
        }

    )

})


module.exports = prosRouter