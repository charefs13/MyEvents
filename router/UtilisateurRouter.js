const utilisateurRouter = require('express').Router()
const bcrypt = require('bcrypt')
const authguard = require("../services/authguard")
const { PrismaClient } = require('@prisma/client');
const hashPasswordExtension = require("../services/hashPasswordExtension");
const prisma = new PrismaClient().$extends(hashPasswordExtension);

// affiche ma main page
utilisateurRouter.get('/', (req, res) => {
    if (req.session.utilisateur) {
        res.render('pages/utilisateurDashboard.twig',
            {
                utilisateur: req.session.utilisateur
            })
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
                if (utilisateur.adresse === null) {
                    req.session.utilisateur = utilisateur
                    res.redirect('/addProfil')

                }
                else {
                    req.session.utilisateur = utilisateur
                    res.redirect('/')
                }
                console.log('Session.utilisateur après connection:')
                console.log(req.session.utilisateur)
            }
            else throw ({ password: "Mot de passe incorrect" });
        } else throw ({ email: "Cet utilisateur n'est pas inscrit" })

    } catch (error) {
        console.log(error)
        res.render('pages/login.twig', {
            error: error
        })
    }
})


// affiche la page pour créer son profil après insciption 

utilisateurRouter.get('/addProfil', (req, res) => {
    console.log(req.session.utilisateur)
    res.render('pages/addProfil.twig',
        { utilisateur: req.session.utilisateur }
    )
    console.log(req.session.utilisateur)

})




utilisateurRouter.post('/addProfil', authguard, async (req, res) => {
    try {
        const updateUtilisateur = await prisma.utilisateur.update({
            where: {
                id: req.session.utilisateur.id
            },
            data: {
                age: req.body.age,
                adresse: req.body.adresse,
                cp: req.body.cp,
                ville: req.body.ville,
                genre: req.body.genre
            }
        })
        req.session.utilisateur = updateUtilisateur
        res.redirect('/')
        console.log(req.session.utilisateur)

    } catch (error) {
        console.log(error)
        res.render('pages/addProfil.twig', {
            error: { error: "une erreur est survenue" }
        })
    }
})


// Deconnexion
utilisateurRouter.get("/logout", authguard, (req, res) => {
    req.session.destroy()
    res.clearCookie('connect.sid')
    res.redirect("/")
})


module.exports = utilisateurRouter   