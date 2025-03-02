const prosRouter = require('express').Router()
const bcrypt = require('bcrypt')
const authguard = require("../services/authguard")
const { PrismaClient } = require('@prisma/client');
const hashPasswordExtension = require("../services/hashPasswordExtension");
const { notificationEmail } = require('../services/sendResetEmail');
const prisma = new PrismaClient().$extends(hashPasswordExtension);


//  affichage de la page d'inscription pour une Entreprise
prosRouter.get('/signInPros', (req, res) => {
    res.render('pages/signInPros.twig')
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
            const objet =  "Bienvenue sur MyEvents – Développez votre activité événementielle !"

            const message = `Bonjour ${req.body.nom} ${req.body.prenom},

            Bienvenue sur MyEvents ! 🎉
            
            En rejoignant notre plateforme, vous bénéficiez d’un outil puissant pour développer votre activité événementielle.

            Avec MyEvents, vous pouvez :
            ✅ Recevoir des demandes de particuliers à la recherche de prestataires
            ✅ Présenter vos services et offres directement sur votre espace
            ✅ Gérer vos prestations et communiquer avec vos clients facilement

            ✨ Optimisez votre visibilité et trouvez de nouveaux clients dès maintenant !
            
            Complétez votre profil et ajoutez vos prestations pour être visible auprès des particuliers en quête de services événementiels.

            
            Une question ? Notre équipe est à votre disposition pour vous aider à tirer le meilleur parti de MyEvents.

            À très bientôt ! 🚀

            L’équipe MyEvents 
            
            📧 auto.myevents@gmail.com | 🌐 www.myevents.com`

            notificationEmail(req.body.email, message, objet)
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

prosRouter.get('/dashboardPros', async (req, res) => {
    try {
        const utilisateur = await prisma.utilisateur.findFirst({
            where: { email: req.session.utilisateur.email },
            include: { entreprise: true, devis: true, evenements: true }
        });
        entreprise = await prisma.entreprise.findFirst({
            where: { utilisateurId: utilisateur.id },
            include: { devis: true }
        });

        res.render('pages/dashboardPros.twig', {
            entreprise: utilisateur.entreprise,
            utilisateur: utilisateur,
            evenements: utilisateur.evenements,
            devisEntreprise: entreprise.devis,
        })
    } catch (error) {
        console.log(error)
        res.render('/', {
            errorMessage: "Une erreur est survenue. Veuillez réessayer plus tard"
        })
    }


})

module.exports = prosRouter