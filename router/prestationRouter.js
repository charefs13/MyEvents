const prestationRouter = require('express').Router()
const authguard = require("../services/authguard")
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();




// Affichage de la page prestation pour ajouter ou modifier des prestations
prestationRouter.get('/prestation', authguard, async (req, res) => {
    const entreprise = await prisma.entreprise.findFirst({
        where: {
            utilisateurId: req.session.utilisateur.id
        },
        include: { prestations: true }
    })
    console.log(req.session.utilisateur)
    console.log(req.session.entreprise)

    res.render('pages/prestation.twig', {
       utilisateur: req.session.utilisateur,
        entreprise: entreprise,
        prestations: entreprise.prestations,
    })
})

// Création d'une prestation
prestationRouter.post('/createPrestation', authguard, async (req, res) => {
    try {
        const { nom, prix, description } = req.body
        const entreprise = await prisma.entreprise.findFirst({
            where: {
                utilisateurId: req.session.utilisateur.id
            },
            include: {
                prestations: true
            }
        })

        await prisma.prestation.create({
            data: {
                nom: nom,
                prix: parseFloat(prix),
                description: description,
                entrepriseId: entreprise.id
            }

        })
        res.redirect('prestation')

    } catch (error) {
        console.log(error)
        res.render('pages/prestation.twig', {
            errorMessage: "Une erreur est survenue, la prestation n'a pas été ajoutée",
            entreprise: req.session.entreprise,
            prestations: req.session.entreprise.prestations

        })
    }
})

// Modification d'une prestation
prestationRouter.post('/updatePrestation/:id', authguard, async (req, res) => {
    try {
        const { nom, description, prix } = req.body

        await prisma.prestation.update({
            where: {
                id: parseInt(req.params.id)
            },
            data: {
                nom: nom,
                prix: parseFloat(prix),
                description : description
            }
        })
        res.redirect('/prestation')
    } catch (error) {
        console.log(error)
        res.redirect('/prestation')
    }
})

// Suppression d'une prestation
prestationRouter.get('/deletePrestation/:id', authguard, async (req, res) => {
    try {
        await prisma.prestation.delete({
            where: {
                id: parseInt(req.params.id)
            }
        })
        res.redirect('/prestation')
    } catch (error) {
        console.log(error)
        res.redirect('/prestation')
    }
})

module.exports = prestationRouter
