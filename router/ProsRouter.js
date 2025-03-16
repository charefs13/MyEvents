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

// Envoi du formulaire d'inscription à la BDD
prosRouter.post('/signInPros', async (req, res) => {
    try {
        const { nom, prenom, email, password, confirmPassword } = req.body;

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
        else if (req.body.password == req.body.confirmPassword) {
            const utilisateur = await prisma.utilisateur.create({
                data: {
                    nom: req.body.nom,
                    prenom: req.body.prenom,
                    email: req.body.email,
                    password: req.body.password,
                    isEntreprise: true
                }
            })
        }

            // Envoi d'un email de bienvenue
            const objet = "Bienvenue sur MyEvents – Développez votre activité événementielle !";
            const message = `Bonjour ${nom} ${prenom},

        Bienvenue sur MyEvents ! 🎉
        ...`;

            notificationEmail(email, message, objet);

            // Message de succès après l'inscription
            req.session.successMessage = " ✅ Votre inscription a été réalisée avec succès. Vous pouvez maintenant vous connecter.";
            res.redirect('/login');
        } catch (error) {
            console.log(error);
            req.session.errorMessage = "Une erreur est survenue. Veuillez réessayer plus tard.";
            res.render('pages/signInPros.twig', { errorMessage: req.session.errorMessage });
        }
    });

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

// Envoi du formulaire pour créer une Entreprise
prosRouter.post('/addProfilPros/:id', authguard, async (req, res) => {
    try {
        const { raisonSociale, siret, type, adresse, cp, ville } = req.body;

        // Vérifications avec regex
        if (scriptInjectionRegex.test(raisonSociale) || scriptInjectionRegex.test(adresse)) {
            req.session.errorMessage = "Caractères invalides détectés.";
            return res.render('pages/addProfilPros.twig', { errorMessage: req.session.errorMessage });
        }
        if (!siretRegex.test(siret)) {
            req.session.errorMessage = "Numéro de SIRET invalide. Un SIRET doit comporter 14 chiffres";
            return res.render('pages/addProfilPros.twig', { errorMessage: req.session.errorMessage });
        }
        if (!postalCodeRegex.test(cp)) {
            req.session.errorMessage = "Code postal invalide.";
            return res.render('pages/addProfilPros.twig', { errorMessage: req.session.errorMessage });
        }
        if (!cityRegex.test(ville)) {
            req.session.errorMessage = "Nom de ville invalide.";
            return res.render('pages/addProfilPros.twig', { errorMessage: req.session.errorMessage });
        }

        // Création de l'entreprise
        const entreprise = await prisma.entreprise.create({
            data: {
                raisonSociale,
                siret,
                type,
                adresse,
                cp: parseInt(cp),
                ville,
                utilisateurId: parseInt(req.session.utilisateur.id)
            }
        });

        // Mise à jour de l'utilisateur
        const updatedUtilisateur = await prisma.utilisateur.update({
            where: { id: parseInt(req.params.id) },
            data: { adresse, cp: parseInt(cp), ville }
        });

        req.session.entreprise = entreprise;
        req.session.utilisateur = updatedUtilisateur;

        // Message de succès après la création de l'entreprise
        req.session.successMessage = "";
        req.session.errorMessage = ""
        res.redirect('/dashboardPros');
    } catch (error) {
        console.log(error);
        req.session.errorMessage = "Une erreur est survenue lors de la création de l'entreprise.";
        res.render('pages/addProfilPros.twig', { errorMessage: req.session.errorMessage });
    }
});


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
