const utilisateurRouter = require('express').Router()
const bcrypt = require('bcrypt')
const authguard = require("../services/authguard")
const { PrismaClient } = require('@prisma/client');
const hashPasswordExtension = require("../services/hashPasswordExtension");
const prisma = new PrismaClient().$extends(hashPasswordExtension);
const crypto = require('crypto');
const { sendResetEmail, sendContactEmail, notificationEmail } = require('../services/sendResetEmail.js');
// Importation des regex depuis le fichier regex.js
const { scriptInjectionRegex, nameRegex, emailRegex, siretRegex } = require('../services/regex');


// Affiche la page principale du dashboard utilisateur
utilisateurRouter.get('/', async (req, res) => {

    if (req.session.utilisateur) {

        // Récupération de l'utilisateur avec ses événements, ses devis et son entreprise
        const utilisateur = await prisma.utilisateur.findFirst({
            where: { email: req.session.utilisateur.email },
            include: { entreprise: true, devis: true, evenements: true }
        });

        // Récupération des événements associés à l'utilisateur
        const events = await prisma.evenement.findMany({
            where: {
                utilisateurId: req.session.utilisateur.id
            },
            include: {
                devis: true // Inclure les devis associés à chaque événement
            }
        });
        entreprise = await prisma.entreprise.findFirst({
            where: { utilisateurId: utilisateur.id },
            include: { devis: true }
        });

        // Mise à jour des données utilisateur en session
        req.session.utilisateur = utilisateur;

        // Si l'utilisateur est une entreprise, afficher son dashboard professionnel
        if (utilisateur.isEntreprise && utilisateur.entreprise) {
            req.session.entreprise = utilisateur.entreprise; // Stocker l'objet entreprise dans la session
            if (req.session.successMessage)  delete req.session.successMessage

            return res.render('pages/dashboardPros.twig', {
                entreprise: utilisateur.entreprise,
                utilisateur: utilisateur,
                devisEntreprise: entreprise.devis,
                successMessage: req.session.successMessage,
                errorMessage: req.session.errorMessage
            });
        }
        if (req.session.successMessage)  delete req.session.successMessage

        // Sinon, afficher le dashboard utilisateur classique
        return res.render('pages/utilisateurDashboard.twig', {
            utilisateur: utilisateur,
            evenements: events, // Passage des événements
            devis: events.flatMap(event => event.devis), // Extraction des devis de chaque événement
            successMessage: req.session.successMessage,
            errorMessage: req.session.errorMessage
        });
    }

    // Si l'utilisateur n'est pas connecté, afficher la page d'accueil
    res.render('pages/main.twig', {
        successMessage: req.session.successMessage,
        errorMessage: req.session.errorMessage
    });
});


// affiche la page qui sommes nous
utilisateurRouter.get('/quiSommesNous', (req, res) => {
    if (req.session.successMessage) {
        delete req.session.successMessage;
    }
    
    if (req.session.errorMessage) {
        delete req.session.errorMessage;
    }
    
    res.render('pages/quiSommesNous.twig'
       
    )
})


// affiche la page pour les professionnels
utilisateurRouter.get('/pros', (req, res) => {
      if (req.session.successMessage) {
        delete req.session.successMessage;
    }
    
    if (req.session.errorMessage) {
        delete req.session.errorMessage;
    }
    res.render('pages/pros.twig')
})


// affiche ma page Inscription
utilisateurRouter.get('/signIn', (req, res) => {
    res.render('pages/signIn.twig', {
        successMessage: req.session.successMessage,
        errorMessage: req.session.errorMessage
    })
})


// envoie mon formulaire Inscription à ma BDD et redirige vers Connexion
utilisateurRouter.post('/signIn', async (req, res) => {
    try {
        // Utilisation des regex importées depuis regex.js pour valider les champs
        // nameRegex et emailRegex sont désormais importées
        errorMessage = ""

        const utilisateurCheck = await prisma.utilisateur.findFirst(
            {
                where: { email: req.body.email }
            })
        if (utilisateurCheck) {
            errorMessage = "Utilisateur déja inscrit. Veuillez vous connecter à votre compte"
            req.session.errorMessage = errorMessage
            res.render("pages/signIn.twig", {
                errorMessage: req.session.errorMessage
            })

        }
        else if (!nameRegex.test(req.body.nom) || !nameRegex.test(req.body.prenom)) {
            errorMessage = "Le nom ou le prénom contient des caractères invalides.";
            req.session.errorMessage = errorMessage
            res.render("pages/signIn.twig", {
                errorMessage: req.session.errorMessage
            })
        } 
        else if (!emailRegex.test(req.body.email)) {
            errorMessage = "L'adresse email n'est pas valide.";
            req.session.errorMessage = errorMessage
            res.render("pages/signIn.twig", {
                errorMessage: req.session.errorMessage
            })
        }
         else if (req.body.password == req.body.confirmPassword) {
                const utilisateur = await prisma.utilisateur.create({
                    data: {
                        nom: req.body.nom,
                        prenom: req.body.prenom,
                        email: req.body.email,
                        password: req.body.password
                    }
                })
                const objet = "Bienvenue sur MyEvents – Organisez vos événements en toute simplicité !"

                const message = `Bonjour ${req.body.nom} ${req.body.prenom},

            Bienvenue sur MyEvents ! 🎉
            
            Nous sommes ravis de vous compter parmi nous.

            Avec MyEvents, vous allez pouvoir organiser vos événements sans stress :

            ✅ Trouvez et contactez des prestataires en quelques clics
            ✅ Planifiez et suivez vos tâches et rendez-vous facilement
            ✅ Gérez vos invitations et informez vos invités en un instant

            ✨ Commencez dès maintenant !Accédez à votre espace personnel et commencez à créer votre événement.

            Besoin d’aide ? Notre équipe est là pour vous accompagner !

            À très bientôt ! 🚀

            L’équipe MyEvents 
            
            📧 auto.myevents@gmail.com | 🌐 www.myevents.com`

                notificationEmail(req.body.email, message, objet)
                req.session.successMessage = " ✅ Votre inscription a été réalisée avec succès. Vous pouvez maintenant vous connecter.";
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
    res.render('pages/login.twig',
       {successMessage: req.session.successMessage} 
    )
})


// affiche ma main page après une connexion
utilisateurRouter.post('/login', async (req, res) => {
    try {
         // Vérifier si un message de succès existe et le supprimer
    if (req.session.successMessage) {
        delete req.session.successMessage; // Supprime le message de succès de la session
    }
    // Vérifier si un message d'erreur existe et le supprimer
    else if (req.session.errorMessage) {
        delete req.session.errorMessage; // Supprime le message d'erreur de la session
    }
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
                        const entreprise = await prisma.entreprise.findFirst({
                            where: {
                                utilisateurId: req.session.utilisateur.id
                            }
                        });

                        req.session.entreprise = entreprise
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
            else throw ({ password: "Utilisateur ou mot de passe incorrect" });
        } else throw ({ email: "Utilisateur ou mot de passe incorrect" })

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
         // Vérifier si un message de succès existe et le supprimer
    if (req.session.successMessage) {
        delete req.session.successMessage; // Supprime le message de succès de la session
    }
    // Vérifier si un message d'erreur existe et le supprimer
    else if (req.session.errorMessage) {
        delete req.session.errorMessage; // Supprime le message d'erreur de la session
    }
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
         // Vérifier si un message de succès existe et le supprimer
    if (req.session.successMessage) {
        delete req.session.successMessage; // Supprime le message de succès de la session
    }
    // Vérifier si un message d'erreur existe et le supprimer
    else if (req.session.errorMessage) {
        delete req.session.errorMessage; // Supprime le message d'erreur de la session
    }
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
        console.log(error);
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
        console.log(error);
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


utilisateurRouter.post('/contact', (req, res) => {
    // Vérifier si un message de succès existe et le supprimer
    if (req.session.successMessage) {
        delete req.session.successMessage; // Supprime le message de succès de la session
    }
    // Vérifier si un message d'erreur existe et le supprimer
    else if (req.session.errorMessage) {
        delete req.session.errorMessage; // Supprime le message d'erreur de la session
    }
    let successMessage = ""
    let errorMessage = ""

    try {
        const { nom, prenom, email, message } = req.body;

        // 1. Validation du nom avec la regex importée (lettres, espaces et tirets autorisés)
        if (!nameRegex.test(nom) || !nameRegex.test(prenom)) {
            errorMessage = "Le nom et le prénom doivent être valides (lettres uniquement, espaces et tirets autorisés)."
            req.session.errorMessage = errorMessage
            return res.redirect("/inProcess")
        }

        // 2. Validation de l'email avec la regex importée
        if (!emailRegex.test(email)) {
            errorMessage = "L'email n'est pas valide."
            req.session.errorMessage = errorMessage
            return res.redirect("/inProcess")
        }

        // 3. Protection contre les injections de code dans le message en utilisant la regex importée
        if (scriptInjectionRegex.test(message)) {
            errorMessage = "Le message contient des caractères non autorisés (HTML, script)."
            req.session.errorMessage = errorMessage
            return res.redirect("/inProcess")
        }

        // Si toutes les validations sont passées, on envoie l'email
        sendContactEmail(nom, prenom, email, message);

        // Message de succès à afficher dans la session (pour informer l'utilisateur)
        successMessage = '✅ Votre message a bien été envoyé.';
        req.session.successMessage = successMessage; // Sauvegarde du message de succès dans la session

        // Redirige l'utilisateur vers la page d'accueil avec le message de succès
        res.redirect('/inProcess');

    } catch (error) {
        console.log(error);  // En cas d'erreur, affiche l'erreur dans la console pour déboguer

        // Message d'erreur à afficher dans la session en cas de problème
        errorMessage = "Une erreur est survenue, votre message n'a pas été envoyé. Veuillez réessayer plus tard.";
        req.session.errorMessage = errorMessage; // Sauvegarde du message d'erreur dans la session

        // Redirige l'utilisateur vers la page d'accueil avec le message d'erreur
        res.redirect('/inProvess');
    }
});

//routes vers page en travaux
utilisateurRouter.get('/paiement/:id', authguard, (req,res)=>

    res.render('pages/inProcess.twig',{
        utilisateur: req.session.utilisateur,
        errorMessage : req.session.errorMessage,
        successMessage: req.session.successMessage
    })
)

utilisateurRouter.get('/inProcess', (req,res)=>
    res.render('pages/inProcess.twig',{
        utilisateur: req.session.utilisateur,
        errorMessage : req.session.errorMessage,
        successMessage: req.session.successMessage
    })
)
module.exports = utilisateurRouter;
