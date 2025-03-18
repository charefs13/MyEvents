const prosRouter = require('express').Router();
const bcrypt = require('bcrypt');
const authguard = require("../services/authguard");
const { PrismaClient } = require('@prisma/client');
const hashPasswordExtension = require("../services/hashPasswordExtension");
const { sendContactEmail, notificationEmail } = require('../services/sendResetEmail.js');
const prisma = new PrismaClient().$extends(hashPasswordExtension);
const { scriptInjectionRegex, nameRegex, emailRegex, siretRegex, postalCodeRegex, cityRegex } = require('../services/regex');

// Affichage de la page d'inscription pour une Entreprise
prosRouter.get('/signInPros', (req, res) => {
    res.render('pages/signInPros.twig', {
        successMessage: req.session.successMessage,
        errorMessage: req.session.errorMessage
    });
});

// Envoie du formulaire d'inscription à ma BDD
prosRouter.post('/signInPros', async (req, res) => {
    try {
        const utilisateurCheck = await prisma.utilisateur.findFirst(
            {
                where: { email: req.body.email }
            })
        if (utilisateurCheck) {
            req.session.errorMessage = "Utilisateur déja inscrit. Veuillez vous connecter à votre compte"
            res.render("pages/signIn.twig", {
                errorMessage: req.session.errorMessage
            })

        }
        const { nom, prenom, email } = req.body
        // Validation des entrées avec les regex
        if (scriptInjectionRegex.test(nom) || scriptInjectionRegex.test(prenom)) {
            req.session.errorMessage = "Caractères invalides détectés.";
            return res.render('pages/signInPros.twig', { errorMessage: req.session.errorMessage });
        }
        else if (!nameRegex.test(req.body.nom) || !nameRegex.test(req.body.prenom)) {
            errorMessage = "Le nom ou le prénom contient des caractères invalides.";
            req.session.errorMessage = errorMessage
            res.render("pages/signInPros.twig", {
                errorMessage: req.session.errorMessage
            })
        }
        else if (!emailRegex.test(email)) {
            req.session.errorMessage = "Adresse email invalide.";
            return res.render('pages/signInPros.twig', { errorMessage: req.session.errorMessage });
        }

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
            const objet = "Bienvenue sur MyEvents – Développez votre activité événementielle !"

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
            req.session.successMessage = " ✅ Votre inscription a été réalisée avec succès. Vous pouvez maintenant vous connecter.";
            res.redirect('/login')
        }
        else throw ({ confirmMdp: "Vos mots de passe ne correspondent pas" })
    } catch (error) {
        console.log(error)
        res.render('pages/signInPros.twig', {
            error: error
        })
    }
})

// Affichage de la page d'ajout de profil pour une Entreprise
prosRouter.get('/addProfilPros', async (req, res) => {
    try {
        const utilisateur = await prisma.utilisateur.findFirst({
            where: { email: req.session.utilisateur.email }
        });

        res.render('pages/addProfilPros.twig', { utilisateur });
    } catch (error) {
        console.error(error);
        req.session.errorMessage = "Une erreur est survenue lors du chargement de votre profil.";
        res.render('pages/addProfilPros.twig', { errorMessage: req.session.errorMessage });
    }
});



// Envoie de mon formulaire ajout profil pour créer une Entreprise
prosRouter.post('/addProfilPros/:id', authguard, async (req, res) => {
    try {

        // Vérifications avec regex
        if (scriptInjectionRegex.test(req.body.raisonSociale) || scriptInjectionRegex.test(req.body.adresse)) {
            req.session.errorMessage = "Caractères invalides détectés.";
            return res.render('pages/addProfilPros.twig', { 
                errorMessage: req.session.errorMessage,
                utilisateur: req.session.utilisateur
                
             });
        }
        if (!siretRegex.test(req.body.siret)) {
            req.session.errorMessage = "Numéro de SIRET invalide. Un SIRET doit comporter 14 chiffres";
            return res.render('pages/addProfilPros.twig', { 
                errorMessage: req.session.errorMessage,
                utilisateur: req.session.utilisateur
                
             });        }
        if (!postalCodeRegex.test(req.body.cp)) {
            req.session.errorMessage = "Code postal invalide.";
            return res.render('pages/addProfilPros.twig', { 
                errorMessage: req.session.errorMessage,
                utilisateur: req.session.utilisateur
                
             });        }
        if (!cityRegex.test(req.body.ville)) {
            req.session.errorMessage = "Nom de ville invalide.";
            return res.render('pages/addProfilPros.twig', { 
                errorMessage: req.session.errorMessage,
                utilisateur: req.session.utilisateur
                
             });        }
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



// Affichage du tableau de bord des professionnels
prosRouter.get('/dashboardPros', async (req, res) => {
    try {
        const utilisateur = await prisma.utilisateur.findFirst({
            where: { email: req.session.utilisateur.email },
            include: { entreprise: true, devis: true, evenements: true }
        });

        const entreprise = await prisma.entreprise.findFirst({
            where: { utilisateurId: utilisateur.id },
            include: { devis: true }
        });

        res.render('pages/dashboardPros.twig', {
            entreprise: utilisateur.entreprise,
            utilisateur,
            evenements: utilisateur.evenements,
            devisEntreprise: entreprise.devis,
        });
    } catch (error) {
        console.log(error);
        res.render('/', { errorMessage: "Une erreur est survenue. Veuillez réessayer plus tard." });
    }
});

module.exports = prosRouter;
