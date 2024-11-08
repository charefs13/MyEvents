const utilisateurRouter = require('express').Router()
const bcrypt = require('bcrypt')
const authguard = require("../services/authguard")
const { PrismaClient } = require('@prisma/client');
const hashPasswordExtension = require("../services/hashPasswordExtension");
const prisma = new PrismaClient().$extends(hashPasswordExtension);
const crypto = require('crypto');
const { sendResetEmail } = require('../services/sendResetEmail.js');



// affiche ma main page
utilisateurRouter.get('/', async (req, res) => {
    if (req.session.utilisateur) {
        if (req.session.utilisateur.isEntreprise) {
            const entreprise = await prisma.utilisateur.findFirst({
                where: {
                    email: req.session.utilisateur.email
                },
                include: { entreprise: true }
            })
            req.session.entreprise = entreprise
            res.render('pages/dashboardPros.twig', {
                entreprise
            })
        }
        else {
            res.render('pages/utilisateurDashboard.twig',
                {
                    utilisateur: req.session.utilisateur
                })
        }
    } else {
        res.render('pages/main.twig')
    }
})


// affiche la page qui sommes nous
utilisateurRouter.get('/quiSommesNous', (req, res) => {
    res.render('pages/quiSommesNous.twig')
})


// affiche la page pour les professionnels
utilisateurRouter.get('/pros', (req, res) => {
    res.render('pages/pros.twig')
})



// affiche ma page Inscription
utilisateurRouter.get('/signIn', (req, res) => {
    res.render('pages/signIn.twig')
})


// envoie mon formulaire Inscription à ma BDD et redirige vers Connexion
utilisateurRouter.post('/signIn', async (req, res) => {
    try {
        if (req.body.password == req.body.confirmPassword) {
            const utilisateur = await prisma.utilisateur.create({
                data: {
                    nom: req.body.nom,
                    prenom: req.body.prenom,
                    email: req.body.email,
                    password: req.body.password
                }
            })
            res.redirect('/login')
        }
        else throw ({ confirmMdp: "Vos mots de passe ne correspondent pas" })
    } catch (error) {

        res.render('pages/signIn.twig', {
            error: error
        })
    }
})


// affiche ma page Connexion
utilisateurRouter.get('/login', (req, res) => {
    res.render('pages/login.twig')
})


// affiche ma main page après une connexion
utilisateurRouter.post('/login', async (req, res) => {
    try {
        const utilisateur = await prisma.utilisateur.findFirst({
            where: {
                email: req.body.email
            }
        })
        if (utilisateur) {

            if (await bcrypt.compare(req.body.password, utilisateur.password)) {
                req.session.utilisateur = utilisateur

                if (utilisateur.isEntreprise) {
                    if (utilisateur.adresse === null) {

                        res.redirect('/addProfilPros')
                    }
                    else {

                        res.redirect('/dashboardPros')
                    }
                }

                else if (utilisateur.adresse === null) {
                    res.redirect('/addProfil')
                }
                else {

                    res.redirect('/')
                }
            }
            else throw ({ password: "Mot de passe incorrect" });
        } else throw ({ email: "Cet utilisateur n'est pas inscrit" })

    } catch (error) {
        res.render('pages/login.twig', {
            error: error
        })
    }
})


// affiche la page pour créer son profil après insciption 
utilisateurRouter.get('/addProfil', (req, res) => {
    res.render('pages/addProfil.twig',
        { utilisateur: req.session.utilisateur }
    )

})




// ajout du profil pour un utilisateur particulier, envoie du profil à la BDD
utilisateurRouter.post('/addProfil/:id', authguard, async (req, res) => {
    try {
        const updateUtilisateur = await prisma.utilisateur.update({
            where: {
                id: parseInt(req.params.id)
            },
            data: {
                age: parseInt(req.body.age),
                adresse: req.body.adresse,
                cp: parseInt(req.body.cp),
                ville: req.body.ville,
                genre: req.body.genre
            }
        })

        req.session.utilisateur = updateUtilisateur
        res.redirect('/')

    } catch (error) {
        res.render('pages/addProfil.twig', {
            error: { error: "une erreur est survenue" }
        })
    }
})


// Deconnexion
utilisateurRouter.get("/logout", authguard, (req, res) => {

    req.session.destroy()
    res.redirect("/")
})


// Affichage de la page mdpOublie  en cliquant sur le lien dans la page login
utilisateurRouter.get('/mdpOublie', (req, res) => {
    res.render('pages/mdpOublie.twig')

})


// envoie le lien de réinitialisation du mdp à l'adresse mail 
utilisateurRouter.post('/forgot-password', async (req, res) => {
    try {
        // Cherche l'utilisateur par email
        const utilisateur = await prisma.utilisateur.findFirst({
            where: { email: req.body.email }
        });
        const email = utilisateur.email
        if (!utilisateur) {
            return res.render('pages/mdpOublie.twig', { error: "L'utilisateur est introuvable" });
        }

        // Génère un jeton de réinitialisation sécurisé
        const token = crypto.randomBytes(32).toString('hex');

        // Stocke le jeton et sa date d'expiration dans la base de données
        await prisma.utilisateur.update({
            where: { email: req.body.email },
            data: {
                resetToken: token,
                resetTokenExpire: new Date(Date.now() + 3600000) // Expire dans 1 heure
            }
        });

        // Génère le lien de réinitialisation de mot de passe
        const resetLink = `http://127.0.0.1:3000/resetPassword/${token}`;

        // Envoie l'email de réinitialisation avec le lien
        sendResetEmail(email, resetLink);

        // Renvoie un message de succès
        res.render('pages/mdpOublie.twig', { message: 'Un lien de réinitialisation a été envoyé à votre adresse mail' });

    } catch (error) {
        console.error(error);
        res.render('pages/mdpOublie.twig', { error: "Une erreur est survenue. Veuillez réessayer plus tard." });
    }
});


// affichage de la page du formulaire de réinitialisation
utilisateurRouter.get('/resetPassword/:token', async (req, res) => {
    const token = req.params.token
    try {
        // Vérifie si un utilisateur avec le jeton et une expiration valide existe
        const utilisateur = await prisma.utilisateur.findFirst({
            where: {
                resetToken: token,
                resetTokenExpire: {
                    gte: new Date() // Vérifie que le token n'est pas expiré
                }
            }
        });

        if (!utilisateur) {
            return res.render('pages/404.twig', { message: "Le lien de réinitialisation est invalide ou expiré." });
        }

        // Affiche le formulaire de réinitialisation de mot de passe
        res.render('pages/resetPassword.twig', { utilisateur });
    } catch (error) {
        console.error(error);
        res.render('resetPassword', { message: "Une erreur est survenue. Veuillez réessayer plus tard." });
    }
});

// envoie du mdp réinitialisé à la bdd
utilisateurRouter.post('/resetPassword/:token', async (req, res) => {
    try {

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!,%*?&])[A-Za-z\d@$!,%*?&]{8,}$/;

        // Validation du mot de passe avec regex
        if (!passwordRegex.test(req.body.password) || !passwordRegex.test(req.body.confirmPassword)) {
            throw { error: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre, et un caractère spécial parmi : @$!,%*?&." };
        }

        if (req.body.password === req.body.confirmPassword) {
            // Vérifie que le jeton est valide et non expiré
            const utilisateur = await prisma.utilisateur.findFirst({
                where: {
                    resetToken: req.params.token,
                    resetTokenExpire: {
                        gte: new Date()
                    }
                }
            });
            if (!utilisateur) {
                throw ({ error: "Le lien de réinitialisation est invalide ou expiré." });
            }

            const hashPassword = await bcrypt.hash(req.body.password, 10)
            await prisma.utilisateur.update({
                where: { id: utilisateur.id },
                data: {
                    password: hashPassword,
                    resetToken: null,
                    resetTokenExpire: null
                }
            });
            res.redirect('/login')
        } else {
            throw ({ error: "Vos mots de passe ne correspondent pas" });
        }
    } catch (error) {
        console.log(error);
        res.render('pages/resetPassword.twig', { error: error });
    }
});  


module.exports = utilisateurRouter;



