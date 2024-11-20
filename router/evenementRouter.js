const evenementRouter = require('express').Router()
const authguard = require("../services/authguard")
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();



//affichage de ma page événement pour ajouter ou modifier des evenements
evenementRouter.get('/evenement', authguard, async (req, res) => {

    const utilisateur = await prisma.utilisateur.findFirst({
        where: {
            email: req.session.utilisateur.email
        },
        include: { evenements: true }

    })
    res.render('pages/evenement.twig',
        {
            utilisateur: req.session.utilisateur,
            evenements: utilisateur.evenements
        })
})

evenementRouter.post('/createEvent', authguard, async (req, res) => {
    try {
        const { typeEvenement, title, descrtiption, startDate, endDate, startTime, endTime } = req.body
        const evenement = await prisma.evenement.create({
            data: {
                type: typeEvenement,
                titre: title,
                description: description,
                dateDebut: new Date(`${startDate}T${startTime}`),
                dateFin: new Date(`${endDate}T${endTime}`),
                utilisateurId: req.session.utilisateur.id
            }
        })

        res.redirect('/')
    } catch (error) {
        console.log(error)
        res.render('pages/evenement.twig', {
            error: error
        })
    }
})


//Modification d'un evenement

evenementRouter.post('/updateEvent/:id', authguard, async (req, res) => {
    try {
        const { typeEvenement, title, description, startDate, endDate, startTime, endTime } = req.body

        const evenement = await prisma.evenement.findFirst({
            where: {
                id: parseInt(req.params.id)
            }
        })

        if (evenement) {
            let startDateTime = evenement.dateDebut;
            let endDateTime = evenement.dateFin;

        }
        // Si l'utilisateur a modifié la date de début
        if (startDate) {
            startDateTime = new Date(startDate);
        }

        // Si l'utilisateur a modifié la date de fin
        if (endDate) {
            endDateTime = new Date(endDate);
        }

        // Si l'utilisateur a modifié l'heure de début
        if (startTime) {
            startDateTime = new Date(`${startDateTime.toISOString().split('T')[0]}T${startTime}`);
        }

        // Si l'utilisateur a modifié l'heure de fin
        if (endTime) {
            endDateTime = new Date(`${endDateTime.toISOString().split('T')[0]}T${endTime}`);
        }
        const updatedEvent = await prisma.evenement.update({

            where: {
                id: parseInt(req.params.id)
            },
            data: {
                type: typeEvenement,
                titre: title,
                description: description,
                dateDebut: startDateTime,
                dateFin: endDateTime,
                utilisateurId: req.session.utilisateur.id
            }
        })
        res.redirect('/evenement')

    } catch (error) {
        console.log(error)
        res.redirect('/evenement')
    }
})


//Suppression d'un événement
evenementRouter.get('/deleteEvent/:id', async (req, res) => {
    try {
        const deleteEvent = await prisma.evenement.delete({
            where: {
                id: parseInt(req.params.id)
            }
        })
        res.redirect('/evenement')
    } catch (error) {
        console.log(error)
        res.redirect('/evenement')
    }
})

module.exports = evenementRouter 