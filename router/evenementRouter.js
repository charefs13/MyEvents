const evenementRouter = require('express').Router()
const authguard = require("../services/authguard")
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();  



//affichage de ma page événement pour ajouter ou modifier des evenements

evenementRouter.get('/evenement', authguard, (req, res) => {
    const utilisateur = req.session.utilisateur

    res.render('pages/evenement.twig', {
        utilisateur
    })
})

evenementRouter.post('/createEvent', authguard, async (req, res) => {
    try {
        const { typeEvenement, title, descrtiption, startDate, endDate, startTime, endTime } = req.body
        const evenement = await prisma.evenement.create({
            data: {
                type: typeEvenement,
                titre: title,
                descrtiption: descrtiption,
                dateDebut: new Date(`${startDate}T${startTime}`),
                dateFin: new Date(`${endDate}T${endTime}`),
                utilisateurId: req.session.utilisateur.id
            }
        })
        req.session.evenement = evenement
        res.redirect('/')
    } catch (error) {
        console.log(error)
        res.render('pages/evenement.twig', {
            error: error
        })
    }
})

module.exports = evenementRouter